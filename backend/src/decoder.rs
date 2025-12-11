use std::{
    collections::{HashMap, HashSet},
    sync::{
        Arc, LazyLock, Mutex, RwLock,
        atomic::{AtomicBool, AtomicU64, Ordering},
    },
    time::{Duration, Instant},
};

use tokio::sync::Notify;
use tokio::sync::mpsc;
use tracing::warn;

use crate::{
    ffmpeg::{
        hw_decoder::{self, extract_frame_window_hw_rgba},
        probe_video_frames,
    },
    future::SharedManualFuture,
};

pub static DECODER: LazyLock<Decoder> = LazyLock::new(|| Decoder::new());

pub struct Decoder {
    decoders: Mutex<HashMap<String, CachedDecoder>>,
}

impl Decoder {
    pub fn new() -> Self {
        Self {
            decoders: Mutex::new(HashMap::new()),
        }
    }

    pub async fn decoder(&self, path: String, width: u32, height: u32) -> CachedDecoder {
        let mut generated = false;
        let decoder = {
            let mut decoders = self.decoders.lock().unwrap();
            decoders
                .entry(path.clone())
                .or_insert_with(|| {
                    generated = true;
                    CachedDecoder::new(path, width, height)
                })
                .clone()
        };

        if generated {
            decoder.start().await;
        }

        decoder
    }
}

#[derive(Debug, Clone)]
pub struct CachedDecoder {
    inner: Arc<Inner>,
}

#[derive(Debug)]
struct Inner {
    path: String,
    width: u32,
    height: u32,
    frames: RwLock<HashMap<u32, SharedManualFuture<Vec<u8>>>>,
    started: AtomicBool,
}

impl CachedDecoder {
    pub fn new(path: String, width: u32, height: u32) -> Self {
        let inner = Inner {
            path,
            width,
            height,
            frames: RwLock::new(HashMap::new()),
            started: AtomicBool::new(false),
        };

        Self {
            inner: Arc::new(inner),
        }
    }

    pub async fn start(&self) {
        let self_clone = self.clone();
        tokio::spawn(async move {
            let total_frames = probe_video_frames(&self_clone.inner.path).unwrap_or_default();

            let result = hw_decoder::extract_frame_window_hw_rgba(
                &self_clone.inner.path,
                0,
                total_frames as _,
                self_clone.inner.width,
                self_clone.inner.height,
            );

            if let Ok(result) = result {
                let mut futures = Vec::new();

                {
                    let mut frames = self_clone.inner.frames.write().unwrap();

                    for (index, frame) in result {
                        let future = frames
                            .entry(index as _)
                            .or_insert_with(|| SharedManualFuture::new())
                            .clone();
                        futures.push((future, frame));
                    }
                }

                for (future, frame) in futures {
                    future.complete(Arc::new(frame)).await;
                }
            }
        });
    }

    pub async fn get_frame(&self, frame_index: u32) -> Arc<Vec<u8>> {
        let future = {
            let mut frames = self.inner.frames.write().unwrap();

            frames
                .entry(frame_index)
                .or_insert_with(|| SharedManualFuture::new())
                .clone()
        };

        let frame = future.get().await;

        {
            //self.inner.frames.write().unwrap().remove(&frame_index);
        }

        frame
    }
}

pub fn generate_empty_frame(width: u32, height: u32) -> Vec<u8> {
    let mut buf = vec![0u8; (width * height * 4) as usize];

    for y in 0..height {
        for x in 0..width {
            let idx = ((y * width + x) * 4) as usize;

            let r = 255u8;
            let g = 0;
            let b = 0;
            let a = 255u8;

            buf[idx] = r;
            buf[idx + 1] = g;
            buf[idx + 2] = b;
            buf[idx + 3] = a;
        }
    }

    buf
}

#[cfg(test)]
mod test {
    use std::time::Instant;

    use tokio::runtime::Builder;

    use crate::{decoder::DECODER, util::resolve_path_to_string};

    #[test]
    fn test() {
        Builder::new_multi_thread()
            .build()
            .unwrap()
            .block_on(async {
                let start = Instant::now();
                let path = resolve_path_to_string("~/Videos/1080p.mp4").unwrap();
                let decoder = DECODER.decoder(path.clone(), 1920, 1080).await;

                let _ = decoder.get_frame(600).await;

                println!("{}[ms]", start.elapsed().as_millis());
            });
    }
}
