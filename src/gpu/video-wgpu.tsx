import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { initWebGPU, uploadAndDrawFrame } from "./webgpu";
import { useCurrentFrame } from "../lib/frame";
import { PROJECT_SETTINGS } from "../../project/project";
import { createManualPromise, type ManualPromise } from "../util/promise";
import { normalizeVideo, video_fps, video_length, type VideoProps } from "./video";
import { useProvideClipDuration } from "../lib/clip";

let promises = new Set<Promise<void>>()

const api = {
  waitWGPUTexture: async () => {
    for (let future of promises) {
      await future
    }
    promises.clear()
  }
};
(window as any).__frameScript = {
  ...(window as any).__frameScript,
  waitWGPUTexture: api.waitWGPUTexture
}

// 旧 WebGPU 経路。VideoCanvasWGPU に改名して残しておく。
export const VideoCanvasWGPU = ({ video, style }: VideoProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const resolved = normalizeVideo(video)
  const fps = useMemo(() => video_fps(resolved), [resolved])
  const durationFrames = useMemo(() => video_length(resolved), [resolved])
  useProvideClipDuration(durationFrames)

  const currentFrame = useCurrentFrame()

  const promise = useRef<ManualPromise<void> | null>(null)

  // Canvas の実ピクセルサイズを要素サイズに合わせる
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ws: WebSocket;

    (async () => {
      await initWebGPU(canvas);

      function connectBackend() {
        ws = new WebSocket("ws://localhost:3000/ws");
        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
          console.log("ws connected");

          // first request
          const req = {
            video: resolved.path,
            width: PROJECT_SETTINGS.width,
            height: PROJECT_SETTINGS.height,
            frame: (currentFrame * fps) / PROJECT_SETTINGS.fps,
          };

          promise.current = createManualPromise()
          promises.add(promise.current.promise)

          ws.send(JSON.stringify(req));
        };

        ws.onmessage = (event) => {
          if (!(event.data instanceof ArrayBuffer)) return;
          const buffer = event.data as ArrayBuffer;
          const view = new DataView(buffer);

          const width = view.getUint32(0, true);
          const height = view.getUint32(4, true);

          const bytes = new Uint8Array(buffer);
          const rgba = bytes.subarray(12);

          uploadAndDrawFrame(rgba, width, height);
          promise.current!.resolve()
        };

        ws.onerror = (error) => {
          console.error("ws error", error);
          promise.current!.reject(error)
        };

        ws.onclose = () => {
          console.log("ws closed");
          connectBackend();
        };

        wsRef.current = ws;
      }

      if (!wsRef.current) {
        connectBackend();
      }
    })();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // currentFrame : PROJECT.fps = x : video.fps
    // x = (currentFrame * video.fps) / PROJECT.fps
    const req = {
      video: resolved.path,
      width: PROJECT_SETTINGS.width,
      height: PROJECT_SETTINGS.height,
      frame: (currentFrame * fps) / PROJECT_SETTINGS.fps,
    };

    promise.current = createManualPromise()
    promises.add(promise.current.promise)

    ws.send(JSON.stringify(req));
  }, [currentFrame, video]);

  const baseStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    border: "1px solid #444",
    backgroundColor: "#000",
    display: "block",
  };

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      style={style ? { ...baseStyle, ...style } : baseStyle}
    />
  );
};
