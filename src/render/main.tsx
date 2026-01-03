import React, { useCallback, useEffect, useRef } from "react"
import ReactDOM from "react-dom/client"
import { PROJECT, PROJECT_SETTINGS } from "../../project/project"
import { Store } from "../util/state"
import { StudioStateContext } from "../lib/studio-state"
import { WithCurrentFrame } from "../lib/frame"
import { useAudioSegments } from "../lib/audio-plan"

const RanderRoot = () => {
  const storeRef = useRef(new Store(false))
  const setIsPlaying = useCallback((flag: boolean) => {
    storeRef.current.set(flag)
  }, [])

  const audioSegments = useAudioSegments()

  useEffect(() => {
    // Debounce: wait for segments to stabilize (no changes for 200ms)
    // This handles React StrictMode double-invocation and async registration
    const timeoutId = setTimeout(() => {
      const setReady = () => {
        ;(window as any).__frameScript = {
          ...(window as any).__frameScript,
          audioPlanReady: true,
        }
      }

      if (audioSegments.length > 0) {
        fetch("http://127.0.0.1:3000/render_audio_plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fps: PROJECT_SETTINGS.fps ?? 60,
            segments: audioSegments,
          }),
        })
          .then(setReady)
          .catch(setReady)
      } else {
        // No segments - mark as ready without POST
        setReady()
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [audioSegments])

  return (
    <StudioStateContext.Provider value={{ isPlaying: false, setIsPlaying, isPlayingStore: storeRef.current, isRender: true }}>
      <WithCurrentFrame>
        <PROJECT />
      </WithCurrentFrame>
    </StudioStateContext.Provider>
  )
}

const root = document.getElementById("root")!

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RanderRoot />
  </React.StrictMode>
)
