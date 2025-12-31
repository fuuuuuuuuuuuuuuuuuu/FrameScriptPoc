import { Clip } from "../src/lib/clip"
import { seconds } from "../src/lib/frame"
import { FillFrame } from "../src/lib/layout/fill-frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"
import { Voice, Ruby } from "../src/lib/voice"

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
            <Voice>私の名は<Ruby reading="でもんすみす">刻まれし魔</Ruby>です</Voice>
          </FillFrame>
        </Clip>
      </TimeLine>
    </Project>
  )
}
