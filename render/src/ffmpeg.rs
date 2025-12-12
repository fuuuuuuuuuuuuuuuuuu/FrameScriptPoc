use std::{
    error::Error,
    path::{Path, PathBuf},
    process::Stdio,
};

use tokio::{
    fs,
    io::AsyncWriteExt,
    process::{Child, ChildStdin, Command},
};

pub struct SegmentWriter {
    child: Child,
    stdin: ChildStdin,
}

impl SegmentWriter {
    pub async fn new(
        output_path: &str,
        width: u32,
        height: u32,
        fps: f64,
        crf: u32,
        encode: &str,
        preset: Option<&str>,
        gop: Option<u32>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let vcodec = match encode {
            "H264" => "libx264",
            "H265" => "libx265",
            _ => return Err(format!("Unsupported encode: {}", encode).into()),
        };

        let preset = preset.unwrap_or("medium");

        let mut cmd = Command::new("ffmpeg");
        cmd.arg("-y")
            .arg("-hide_banner")
            .arg("-loglevel")
            .arg("error")
            .arg("-f")
            .arg("image2pipe")
            .arg("-vcodec")
            .arg("png")
            .arg("-framerate")
            .arg(format!("{}", fps))
            .arg("-s")
            .arg(format!("{}x{}", width, height))
            .arg("-i")
            .arg("pipe:0")
            .arg("-r")
            .arg(format!("{}", fps))
            .arg("-c:v")
            .arg(vcodec)
            .arg("-preset")
            .arg(preset)
            .arg("-crf")
            .arg(crf.to_string())
            .arg("-pix_fmt")
            .arg("yuv420p")
            .arg("-movflags")
            .arg("+faststart");

        if let Some(g) = gop {
            cmd.arg("-g")
                .arg(g.to_string())
                .arg("-keyint_min")
                .arg(g.to_string())
                .arg("-sc_threshold")
                .arg("0");
        }

        cmd.arg(output_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .stderr(Stdio::inherit());

        let mut child = cmd.spawn().map_err(|e| {
            format!(
                "Failed to spawn ffmpeg. Is ffmpeg installed and on PATH? error={}",
                e
            )
        })?;

        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| "Failed to open ffmpeg stdin".to_string())?;

        Ok(Self { child, stdin })
    }

    pub async fn write_png_frame(&mut self, png: &[u8]) -> Result<(), Box<dyn Error>> {
        self.stdin.write_all(png).await?;
        Ok(())
    }

    pub async fn finish(mut self) -> Result<(), Box<dyn Error>> {
        self.stdin.shutdown().await?;
        drop(self.stdin);

        let status = self.child.wait().await?;
        if !status.success() {
            return Err(format!("ffmpeg exited with status: {}", status).into());
        }
        Ok(())
    }
}

fn escape_concat_path(p: &str) -> String {
    p.replace('\'', r"'\''")
}

pub async fn concat_segments_mp4(
    segments: Vec<PathBuf>,
    output_path: &Path,
) -> Result<(), Box<dyn Error>> {
    if segments.is_empty() {
        return Err("No segment files.".into());
    }

    let list_path = output_path.with_extension("segments.txt");

    let mut lines = String::new();
    for seg in segments {
        let abs = tokio::task::spawn_blocking(move || std::fs::canonicalize(seg))
            .await??
            .to_string_lossy()
            .to_string();

        lines.push_str("file '");
        lines.push_str(&escape_concat_path(&abs));
        lines.push_str("'\n");
    }

    fs::write(&list_path, lines).await?;

    let status = Command::new("ffmpeg")
        .arg("-y")
        .arg("-hide_banner")
        .arg("-loglevel")
        .arg("error")
        .arg("-f")
        .arg("concat")
        .arg("-safe")
        .arg("0")
        .arg("-i")
        .arg(&list_path)
        .arg("-c")
        .arg("copy")
        .arg("-movflags")
        .arg("+faststart")
        .arg(output_path)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::inherit())
        .status()
        .await?;

    if !status.success() {
        return Err(format!("ffmpeg concat failed: {}", status).into());
    }

    Ok(())
}
