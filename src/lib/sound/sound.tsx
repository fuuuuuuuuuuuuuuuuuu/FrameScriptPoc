import { useEffect, useId, useMemo } from "react"
import { PROJECT_SETTINGS } from "../../../project/project"
import { useClipRange, useProvideClipDuration } from "../clip"
import { registerAudioSegmentGlobal, unregisterAudioSegmentGlobal } from "../audio-plan"

export type Sound = {
  path: string
}

export type SoundProps = {
  sound: Sound | string
  trimStart?: number // project frames
  trimEnd?: number // project frames
}

export const normalizeSound = (sound: Sound | string): Sound => {
  if (typeof sound === "string") return { path: sound }
  return sound
}

const buildMetaUrl = (sound: Sound) => {
  const url = new URL("http://localhost:3000/audio/meta")
  url.searchParams.set("path", sound.path)
  return url.toString()
}

const soundLengthCache = new Map<string, number>()
const MAX_REASONABLE_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export const sound_length = (sound: Sound | string): number => {
  const resolved = normalizeSound(sound)

  if (soundLengthCache.has(resolved.path)) {
    return soundLengthCache.get(resolved.path)!
  }

  try {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", buildMetaUrl(resolved), false) // 同期リクエストで初期ロード用途
    xhr.send()

    if (xhr.status >= 200 && xhr.status < 300) {
      const payload = JSON.parse(xhr.responseText) as { duration_ms?: number }
      const rawMs = typeof payload.duration_ms === "number" ? payload.duration_ms : 0
      if (!Number.isFinite(rawMs) || rawMs <= 0 || rawMs > MAX_REASONABLE_DURATION_MS) {
        return 0
      }
      const seconds = rawMs / 1000
      const frames = Math.round(seconds * PROJECT_SETTINGS.fps)
      if (frames > 0) {
        soundLengthCache.set(resolved.path, frames)
      }
      return frames
    }
  } catch (error) {
    console.error("sound_length(): failed to fetch metadata", error)
  }

  soundLengthCache.set(resolved.path, 0)
  return 0
}

export const Sound = ({ sound, trimStart = 0, trimEnd = 0 }: SoundProps) => {
  const id = useId()
  const clipRange = useClipRange()
  const resolvedSound = useMemo(() => normalizeSound(sound), [sound])
  const rawDurationFrames = useMemo(
    () => sound_length(resolvedSound),
    [resolvedSound],
  )
  const trimStartFrames = Math.max(0, Math.floor(trimStart))
  const trimEndFrames = Math.max(0, Math.floor(trimEnd))
  const durationFrames = Math.max(
    0,
    rawDurationFrames - trimStartFrames - trimEndFrames,
  )

  useProvideClipDuration(durationFrames)

  useEffect(() => {
    if (!clipRange) return

    const projectStartFrame = clipRange.start
    const clipDurationFrames = Math.max(0, clipRange.end - clipRange.start + 1)
    const availableFrames = durationFrames
    const clamped = Math.min(clipDurationFrames, availableFrames)
    if (clamped <= 0) return

    registerAudioSegmentGlobal({
      id,
      source: { kind: "sound", path: resolvedSound.path },
      projectStartFrame,
      sourceStartFrame: trimStartFrames,
      durationFrames: clamped,
    })

    return () => {
      unregisterAudioSegmentGlobal(id)
    }
  }, [clipRange, durationFrames, id, resolvedSound.path, trimStartFrames])

  return null
}
