import React from "react"
import ReactDOM from "react-dom/client"
import { PROJECT } from "../../project/project"
import { Store } from "../util/state"
import { StudioStateContext } from "../StudioApp"
import { WithCurrentFrame } from "../lib/frame"

const RanderRoot = () => {
  return (
    <StudioStateContext value={{ isPlaying: false, setIsPlaying: () => { }, isPlayingStore: new Store(false) }}>
      <WithCurrentFrame>
        <PROJECT />
      </WithCurrentFrame>
    </StudioStateContext>
  )
}

const root = document.getElementById("root")!

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RanderRoot />
  </React.StrictMode>
)
