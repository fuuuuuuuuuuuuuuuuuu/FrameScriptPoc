pub mod ffmpeg;

use std::{
    fs::canonicalize,
    io,
    path::Path,
    sync::Arc,
    time::{Duration, Instant},
};

use chromiumoxide::{
    Browser, Handler, Page,
    cdp::browser_protocol::{
        emulation::{SetVirtualTimePolicyParams, VirtualTimePolicy},
        page::CaptureScreenshotFormat,
    },
    error::CdpError,
    handler::viewport::Viewport,
    page::ScreenshotParams,
};
use futures::{StreamExt, stream::FuturesUnordered};
use tokio::{
    runtime::{Builder, Runtime},
    sync::Semaphore,
};

use chromiumoxide::browser::BrowserConfig;
use std::path::PathBuf;
use tempfile::TempDir;

use crate::ffmpeg::SegmentWriter;

async fn spawn_browser_instance(
    profile_id: usize,
    width: u32,
    height: u32,
) -> Result<(Browser, Handler), Box<dyn std::error::Error>> {
    // 一時ディレクトリをブラウザプロファイルとして使う
    let tmp = TempDir::new()?; // ライフタイム管理は適宜
    let user_data_dir: PathBuf = tmp.path().join(format!("profile-{}", profile_id));

    let config = BrowserConfig::builder()
        .new_headless_mode()
        .viewport(Viewport {
            width,
            height,
            device_scale_factor: None,
            emulating_mobile: false,
            is_landscape: false,
            has_touch: false,
        })
        .request_timeout(Duration::from_hours(24))
        .user_data_dir(user_data_dir) // ★ インスタンスごとに別のディレクトリ
        .build()?;

    let (browser, handler) = Browser::launch(config).await?;
    Ok((browser, handler))
}

async fn wait_for_next_frame(page: &Page) {
    let script = r#"
        (async () => {
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          });
        })()
    "#;
    page.evaluate(script).await.unwrap();
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = std::env::args().collect::<Vec<String>>();

    if args.len() < 2 {
        return Err("Invalid command.".into());
    }

    let splited = args[1].split(":").collect::<Vec<_>>();

    if splited.len() != 7 {
        return Err("Invalid command(split).".into());
    }

    let max_parallel = 4usize; // ここを調整（まずは 2〜4 推奨）
    let sem = Arc::new(Semaphore::new(max_parallel));

    let width = splited[0].parse::<u32>()?;
    let height = splited[1].parse::<u32>()?;
    let fps = splited[2].parse::<f64>()?;
    let total_frames = splited[3].parse::<usize>()?;
    let workers = splited[4].parse::<usize>()?;
    let encode = splited[5].to_string();
    let preset = splited[6].to_string();

    let chunk = total_frames / (workers - 1).max(1);

    //let file = format!("file://{}", canonicalize("index.html")?.to_string_lossy());
    let url = "http://localhost:5173/render";

    let mut tasks = FuturesUnordered::new();

    let start = Instant::now();

    for worker_id in 0..workers {
        let permit = sem.clone().acquire_owned().await.unwrap();

        let start = worker_id * chunk;
        let end = ((worker_id + 1) * chunk).min(total_frames);

        let encode_clone = encode.clone();
        let preset_clone = preset.clone();

        tasks.push(tokio::spawn(async move {
            let _permit = permit;

            let (mut browser, mut handler) = spawn_browser_instance(worker_id, width, height)
                .await
                .unwrap();

            tokio::spawn(async move { while handler.next().await.is_some() {} });

            let out = format!("frames/segment-{worker_id:03}.mp4");
            let mut writer = SegmentWriter::new(
                &out,
                width,
                height,
                fps,
                18,
                &encode_clone,
                Some(&preset_clone),
                Some(fps as u32),
            )
            .await
            .unwrap();

            let page = browser.new_page(url).await.unwrap();
            page.wait_for_navigation().await.unwrap();

            for frame in start..end {
                wait_for_next_frame(&page).await;

                let js = format!(
                    r#"
                    window.__frameScript.setFrame({})
                    "#,
                    frame
                );
                page.evaluate(js).await.unwrap();

                wait_for_next_frame(&page).await;

                let script = format!(
                    r#"
                    (async () => {{
                      await window.__frameScript.waitCanvasFrame({});
                    }})()
                "#,
                    frame
                );
                page.evaluate(script).await.unwrap();

                let bytes = page
                    .screenshot(
                        ScreenshotParams::builder()
                            .format(CaptureScreenshotFormat::Png)
                            .omit_background(true)
                            .build(),
                    )
                    .await
                    .unwrap();

                writer.write_png_frame(&bytes).await.unwrap();
            }

            writer.finish().await.unwrap();

            browser.close().await.unwrap();
        }));
    }

    while let Some(_) = tasks.next().await {}

    println!("TOTAL : {}[ms]", start.elapsed().as_millis());

    Ok(())
}
