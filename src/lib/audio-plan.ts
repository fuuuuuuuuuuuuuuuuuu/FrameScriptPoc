import { useSyncExternalStore } from "react"

export type AudioSourceRef =
  | { kind: "video"; path: string }
  | { kind: "sound"; path: string } // reserved for future <Sound />

export type AudioSegment = {
  id: string
  source: AudioSourceRef
  projectStartFrame: number
  sourceStartFrame: number
  durationFrames: number
}

type Listener = () => void

let globalSegments: AudioSegment[] = []
const globalListeners = new Set<Listener>()

const subscribeGlobal = (listener: Listener) => {
  globalListeners.add(listener)
  return () => globalListeners.delete(listener)
}

const notifyGlobal = () => {
  globalListeners.forEach((listener) => listener())
}

const getGlobalSegments = () => globalSegments

export const registerAudioSegmentGlobal = (segment: AudioSegment) => {
  const existing = globalSegments.find((item) => item.id === segment.id)
  if (
    existing &&
    existing.source.kind === segment.source.kind &&
    ("path" in existing.source ? existing.source.path : "") ===
      ("path" in segment.source ? segment.source.path : "") &&
    existing.projectStartFrame === segment.projectStartFrame &&
    existing.sourceStartFrame === segment.sourceStartFrame &&
    existing.durationFrames === segment.durationFrames
  ) {
    return
  }

  globalSegments = [
    ...globalSegments.filter((item) => item.id !== segment.id),
    segment,
  ]
  notifyGlobal()
}

export const unregisterAudioSegmentGlobal = (id: string) => {
  const next = globalSegments.filter((segment) => segment.id !== id)
  if (next.length === globalSegments.length) return
  globalSegments = next
  notifyGlobal()
}

export const useAudioSegments = () => {
  return useSyncExternalStore(subscribeGlobal, getGlobalSegments)
}
