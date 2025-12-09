import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame, useSetGlobalCurrentFrame } from "../lib/frame";
import { PROJECT_SETTINGS } from "../../project/project";
import { useIsPlaying } from "../StudioApp";
import { useClipActive, useClipStart, useProvideClipDuration } from "../lib/clip";

export type Video = {
  path: string
}

type VideoCanvasProps = {
  video: Video | string
  style?: CSSProperties
}

const videoLengthCache = new Map<string, number>()

const normalizeVideo = (video: Video | string): Video => {
  if (typeof video === "string") return { path: video }
  return video
}

const buildVideoUrl = (video: Video) => {
  const url = new URL("http://localhost:3000/video");
  url.searchParams.set("path", video.path);
  return url.toString();
}

const buildMetaUrl = (video: Video) => {
  const url = new URL("http://localhost:3000/video/meta");
  url.searchParams.set("path", video.path);
  return url.toString();
}

// 非 async で長さ（フレーム数）を取得。2 回目以降はキャッシュを返す。
// 返り値はプロジェクトの FPS に合わせたフレーム数（動画 FPS と異なる場合があるので duration を換算）。
export const video_length = (video: Video | string): number => {
  const resolved = normalizeVideo(video)

  if (videoLengthCache.has(resolved.path)) {
    return videoLengthCache.get(resolved.path)!
  }

  try {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", buildMetaUrl(resolved), false) // 同期リクエストで初期ロード用途
    xhr.send()

    if (xhr.status >= 200 && xhr.status < 300) {
      const payload = JSON.parse(xhr.responseText) as { duration_ms?: number }
      const seconds = typeof payload.duration_ms === "number"
        ? Math.max(0, payload.duration_ms) / 1000
        : 0
      const frames = Math.round(seconds * PROJECT_SETTINGS.fps)
      videoLengthCache.set(resolved.path, frames)
      return frames
    }
  } catch (error) {
    console.error("video_length(): failed to fetch metadata", error)
  }

  videoLengthCache.set(resolved.path, 0)
  return 0
}

export const VideoCanvas = ({ video, style }: VideoCanvasProps) => {
  const resolvedVideo = useMemo(() => normalizeVideo(video), [video])
  const elementRef = useRef<HTMLVideoElement | null>(null);
  const currentFrame = useCurrentFrame()
  const isPlaying = useIsPlaying()
  const isVisible = useClipActive()
  const playingFlag = useRef(false)
  const pendingSeek = useRef<number | null>(null)
  const durationFrames = useMemo(() => video_length(resolvedVideo), [resolvedVideo])
  useProvideClipDuration(durationFrames)

  useEffect(() => {
    const el = elementRef.current
    if (!el || isPlaying) return

    const time = currentFrame / PROJECT_SETTINGS.fps
    if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
      el.currentTime = time
      pendingSeek.current = null
    } else {
      pendingSeek.current = time
    }
  }, [currentFrame, isPlaying])

  const src = useMemo(() => {
    return buildVideoUrl(resolvedVideo);
  }, [resolvedVideo.path])

  const baseStyle: CSSProperties = {
    width: 640,
    height: 360,
    border: "1px solid #444",
    backgroundColor: "#000",
  }

  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    if (isPlaying && isVisible) {
      if (!playingFlag.current) {
        el.play()
        playingFlag.current = true
      }
    } else {
      el.pause()
      playingFlag.current = false
    }
  }, [isPlaying, isVisible])

  const setGlobalCurrentFrame = useSetGlobalCurrentFrame()
  const clipStart = useClipStart() ?? 0

  useEffect(() => {
    const el = elementRef.current
    if (!el || !isPlaying || !isVisible) return

    let raf: number | null = null
    const tick = () => {
      const time = el.currentTime
      const frame = Math.round(time * PROJECT_SETTINGS.fps)
      setGlobalCurrentFrame(frame + clipStart)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf != null) cancelAnimationFrame(raf)
    }
  }, [clipStart, isPlaying, isVisible, setGlobalCurrentFrame])

  return (
    <video
      ref={elementRef}
      src={src}
      onLoadedMetadata={() => {
        const el = elementRef.current
        if (!el) return
        if (pendingSeek.current != null) {
          el.currentTime = pendingSeek.current
          pendingSeek.current = null
        }
      }}
      onEnded={() => elementRef.current?.pause()}
      style={style ? { ...baseStyle, ...style } : baseStyle}
    />
  );
};
