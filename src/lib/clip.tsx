import { useEffect, useId } from "react"
import { useCurrentFrame } from "./frame"
import { useTimelineRegistration } from "./timeline"
import { registerClipGlobal, unregisterClipGlobal } from "./timeline"

type ClipProps = {
  start: number
  end: number
  label?: string
  children: React.ReactNode
}

export const Clip = ({ start, end, label, children }: ClipProps) => {
  const currentFrame = useCurrentFrame()
  const timeline = useTimelineRegistration()
  const registerClip = timeline?.registerClip
  const unregisterClip = timeline?.unregisterClip
  const id = useId()

  useEffect(() => {
    if (registerClip && unregisterClip) {
      registerClip({ id, start, end, label })
      return () => {
        unregisterClip(id)
      }
    }

    registerClipGlobal({ id, start, end, label })
    return () => unregisterClipGlobal(id)
  }, [registerClip, unregisterClip, id, start, end, label])

  if (currentFrame < start || currentFrame >= end) {
    return null;
  }

  return <>{children}</>;
}
