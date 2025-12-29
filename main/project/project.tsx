import { Clip } from "../src/lib/clip"
import { seconds } from "../src/lib/frame"
import { FillFrame } from "../src/lib/layout/fill-frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { Sound } from "../src/lib/sound/sound"
import { TimeLine } from "../src/lib/timeline"
import { Video } from "../src/lib/video/video"

export const PROJECT_SETTINGS: ProjectSettings = {
  name: "framescript-template",
  width: 1920,
  height: 1080,
  fps: 60,
}

const ApexClip = () => {
  return (
    <Clip label="Apex Gameplay" duration={seconds(8)}>
      <Video video="project/videos/apex.mp4" />
    </Clip>
  )
}

const ApexSubtitle = () => {
  return (
    <Clip label="Apex Subtitle" duration={seconds(8)}>
      <FillFrame
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 80px 64px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: "#f8fafc",
            backgroundColor: "rgba(0,0,0,0.65)",
            padding: "12px 32px",
            borderRadius: 16,
          }}
        >
          フラットラインの性能試してみた
        </div>
      </FillFrame>
    </Clip>
  )
}

const ApexSoundClip = () => {
  return (
    <Clip label="Apex Sound">
      <Sound sound="project/audio/flatline.wav" />
    </Clip>
  )
}

export const PROJECT = () => {
  return (
    <Project>
      <TimeLine>
        <ApexClip />
        <ApexSubtitle />
        <ApexSoundClip />
      </TimeLine>
    </Project>
  )
}
