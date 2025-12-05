import React, { useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react"

type TimeLineProps = {
  children?: React.ReactNode
}

export type TimelineClip = {
  id: string
  start: number
  end: number
  label?: string
}

type TimelineContextValue = {
  clips: TimelineClip[]
  registerClip: (clip: TimelineClip) => void
  unregisterClip: (id: string) => void
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null)

type Listener = () => void

let globalClips: TimelineClip[] = []
const globalListeners = new Set<Listener>()

const subscribeGlobal = (listener: Listener) => {
  globalListeners.add(listener)
  return () => globalListeners.delete(listener)
}

const notifyGlobal = () => {
  globalListeners.forEach((listener) => listener())
}

const getGlobalClips = () => globalClips

export const registerClipGlobal = (clip: TimelineClip) => {
  globalClips = [...globalClips.filter((item) => item.id !== clip.id), clip]
  notifyGlobal()
}

export const unregisterClipGlobal = (id: string) => {
  globalClips = globalClips.filter((clip) => clip.id !== id)
  notifyGlobal()
}

export const TimeLine = ({ children }: TimeLineProps) => {
  const existingContext = useContext(TimelineContext)
  const [clips, setClips] = useState<TimelineClip[]>([])

  const registerClip = useCallback((clip: TimelineClip) => {
    setClips((prev) => {
      const next = prev.filter((item) => item.id !== clip.id)
      return [...next, clip]
    })
    registerClipGlobal(clip)
  }, [])

  const unregisterClip = useCallback((id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id))
    unregisterClipGlobal(id)
  }, [])

  const value = useMemo(
    () => ({
      clips,
      registerClip,
      unregisterClip,
    }),
    [clips, registerClip, unregisterClip],
  )

  if (existingContext) {
    return <>{children}</>
  }

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>
}

export const useTimelineClips = () => {
  const context = useContext(TimelineContext)
  const clips = useSyncExternalStore(subscribeGlobal, getGlobalClips)
  if (context) {
    return context.clips
  }
  return clips
}

export const useTimelineRegistration = () => {
  return useContext(TimelineContext)
}
