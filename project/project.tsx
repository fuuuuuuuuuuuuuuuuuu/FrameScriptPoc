import { Clip } from "../src/lib/clip"
import { seconds } from "../src/lib/frame"
import { FillFrame } from "../src/lib/layout/fill-frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"
import { Voice } from "../src/lib/voice"

export const PROJECT_SETTINGS: ProjectSettings = {
  name: "framescript-template",
  width: 1920,
  height: 1080,
  fps: 60,
}

export const PROJECT = () => {
  return (
    <Project>
      <TimeLine>
        <Clip label="Voice1" duration={seconds(2)}>
          <FillFrame style={{ alignItems: "center", justifyContent: "center" }}>
            <Voice>こんにちわなのだ</Voice>
          </FillFrame>
        </Clip>
        <Clip label="Voice2" start={seconds(2)} duration={seconds(2)}>
          <FillFrame style={{ alignItems: "center", justifyContent: "center" }}>
            <Voice>元気にしてたか？</Voice>
          </FillFrame>
        </Clip>
      </TimeLine>
    </Project>
  )
}
