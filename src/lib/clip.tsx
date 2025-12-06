import { createContext, useContext, useEffect, useId } from "react"
import { useGlobalCurrentFrame } from "./frame"
import { useClipVisibility, useTimelineRegistration } from "./timeline"
import { registerClipGlobal, unregisterClipGlobal } from "./timeline"

type ClipProps = {
  start: number
  end: number
  label?: string
  children: React.ReactNode
}

type ClipContextValue = { id: string; baseStart: number; baseEnd: number; depth: number; active: boolean }

const ClipContext = createContext<ClipContextValue | null>(null)

export const Clip = ({ start, end, label, children }: ClipProps) => {
  const currentFrame = useGlobalCurrentFrame()
  const timeline = useTimelineRegistration()
  const registerClip = timeline?.registerClip
  const unregisterClip = timeline?.unregisterClip
  const id = useId()
  const isVisible = useClipVisibility(id)

  const clipContext = useContext(ClipContext)

  const parentBase = clipContext?.baseStart ?? 0
  const parentEnd = clipContext?.baseEnd ?? Number.POSITIVE_INFINITY
  const parentDepth = clipContext?.depth ?? -1
  const parentId = clipContext?.id ?? null
  const absoluteStart = parentBase + start
  const absoluteEnd = parentBase + end
  const clampedStart = Math.max(absoluteStart, parentBase)
  const clampedEnd = Math.min(absoluteEnd, parentEnd)
  const hasSpan = clampedEnd >= clampedStart
  const depth = parentDepth + 1
  const isActive = hasSpan && currentFrame >= clampedStart && currentFrame <= clampedEnd && isVisible

  useEffect(() => {
    if (!hasSpan) return

    if (registerClip && unregisterClip) {
      registerClip({ id, start: clampedStart, end: clampedEnd, label, depth, parentId })
      return () => {
        unregisterClip(id)
      }
    }

    registerClipGlobal({ id, start: clampedStart, end: clampedEnd, label, depth, parentId })
    return () => unregisterClipGlobal(id)
  }, [registerClip, unregisterClip, id, clampedStart, clampedEnd, label, depth, hasSpan, parentId])

  return (
    <ClipContext.Provider value={{ id, baseStart: clampedStart, baseEnd: clampedEnd, depth, active: isActive }}>
      <div style={{ display: isActive ? "contents" : "none" }}>
        {children}
      </div>
    </ClipContext.Provider>
  )
}

export const useClipStart = () => {
  const ctx = useContext(ClipContext)
  return ctx?.baseStart ?? null
}

export const useClipDepth = () => {
  const ctx = useContext(ClipContext)
  return ctx?.depth ?? null
}

export const useClipActive = () => {
  const ctx = useContext(ClipContext)
  return ctx?.active ?? false
}
