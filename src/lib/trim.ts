export type Trim =
  | { trimStart: number; trimEnd: number }
  | { from: number; duration: number }

export type ResolvedTrim = {
  trimStartFrames: number
  trimEndFrames: number
}

const toFrames = (value: number | undefined) =>
  Math.max(0, Math.floor(Number.isFinite(value as number) ? (value as number) : 0))

export const resolveTrimFrames = (params: {
  rawDurationFrames: number
  trim?: Trim
}): ResolvedTrim => {
  const rawDurationFrames = Math.max(0, Math.floor(params.rawDurationFrames))

  const trim = params.trim
  if (trim) {
    if ("from" in trim) {
      const from = toFrames(trim.from)
      const duration = toFrames(trim.duration)
      const endExclusive = from + duration
      const trimStartFrames = from
      const trimEndFrames =
        rawDurationFrames > 0 ? Math.max(0, rawDurationFrames - endExclusive) : 0
      return { trimStartFrames, trimEndFrames }
    }

    return {
      trimStartFrames: toFrames(trim.trimStart),
      trimEndFrames: toFrames(trim.trimEnd),
    }
  }

  return { trimStartFrames: 0, trimEndFrames: 0 }
}
