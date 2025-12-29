import React, { useContext, useEffect, useState } from "react"
import { PROJECT_SETTINGS } from "../../project/project"

type CurrentFrame = {
  currentFrame: number
  setCurrentFrame: (frame: number) => void
}

const CURRENT_FRAME_CONTEXT_KEY = "__frameScript_CurrentFrameContext"
const CLIP_START_CONTEXT_KEY = "__frameScript_ClipStartContext"
const CurrentFrameContext: React.Context<CurrentFrame | null> = (() => {
  const g = globalThis as unknown as Record<string, unknown>
  const existing = g[CURRENT_FRAME_CONTEXT_KEY] as React.Context<CurrentFrame | null> | undefined
  if (existing) return existing
  const created = React.createContext<CurrentFrame | null>(null)
  g[CURRENT_FRAME_CONTEXT_KEY] = created
  return created
})()

const ClipStartContext: React.Context<number | null> = (() => {
  const g = globalThis as unknown as Record<string, unknown>
  const existing = g[CLIP_START_CONTEXT_KEY] as React.Context<number | null> | undefined
  if (existing) return existing
  const created = React.createContext<number | null>(null)
  g[CLIP_START_CONTEXT_KEY] = created
  return created
})()

/**
 * Provides a clip start offset for nested content.
 *
 * クリップの開始フレームを子要素に伝えるための Provider。
 *
 * @example
 * ```tsx
 * <WithClipStart start={60}>
 *   <Scene />
 * </WithClipStart>
 * ```
 */
export const WithClipStart: React.FC<{ start: number; children: React.ReactNode }> = ({ start, children }) => {
  return <ClipStartContext value={start}>{children}</ClipStartContext>
}

/**
 * Provides global current frame state for Studio and renderer.
 *
 * Studio とレンダラのためにグローバルな currentFrame を提供します。
 *
 * @example
 * ```tsx
 * <WithCurrentFrame>
 *   <Project />
 * </WithCurrentFrame>
 * ```
 */
export const WithCurrentFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    // Expose setters for headless rendering / automation (e.g., Chromium driving frames)
    const api = {
      setFrame: (frame: number) => setCurrentFrame(Math.max(0, Math.floor(frame))),
      getFrame: () => currentFrame,
    };
    (window as any).__frameScript = {
      ...(window as any).__frameScript,
      setFrame: api.setFrame,
      getFrame: api.getFrame,
    }
    return () => {
      if ((window as any).__frameScript) {
        delete (window as any).__frameScript.setFrame
        delete (window as any).__frameScript.getFrame
      }
    }
  }, [currentFrame])

  return (
    <CurrentFrameContext value={{ currentFrame, setCurrentFrame }}>
      {children}
    </CurrentFrameContext>
  )
}

/**
 * Returns the current frame relative to the nearest clip start.
 *
 * 直近のクリップ開始を基準にした現在フレームを返します。
 *
 * @example
 * ```tsx
 * const frame = useCurrentFrame()
 * ```
 */
export const useCurrentFrame = () => {
  const ctx = useContext(CurrentFrameContext);
  if (!ctx) throw new Error("useCurrentFrame must be used inside <WithCurrentFrame>");

  const clipStart = useContext(ClipStartContext) ?? 0
  return Math.max(ctx.currentFrame - clipStart, 0)
}

/**
 * Returns the project-global current frame.
 *
 * プロジェクト全体の現在フレームを返します。
 *
 * @example
 * ```tsx
 * const frame = useGlobalCurrentFrame()
 * ```
 */
export const useGlobalCurrentFrame = () => {
  const ctx = useContext(CurrentFrameContext);
  if (!ctx) throw new Error("useCurrentFrame must be used inside <WithCurrentFrame>");
  return ctx.currentFrame;
}

/**
 * Returns a setter to update the global current frame.
 *
 * グローバルの currentFrame を更新する setter を返します。
 *
 * @example
 * ```tsx
 * const setFrame = useSetGlobalCurrentFrame()
 * setFrame(120)
 * ```
 */
export const useSetGlobalCurrentFrame = () => {
  const ctx = useContext(CurrentFrameContext)
  if (!ctx) throw new Error("useCurrentFrame must be used inside <WithCurrentFrame>");
  return ctx.setCurrentFrame;
}

/**
 * Converts seconds to frames using project FPS.
 *
 * プロジェクトの FPS に基づいて秒数をフレーム数に変換します。
 *
 * @example
 * ```ts
 * const frames = seconds(1.5)
 * ```
 */
export function seconds(seconds: number): number {
  return PROJECT_SETTINGS.fps * seconds
}
