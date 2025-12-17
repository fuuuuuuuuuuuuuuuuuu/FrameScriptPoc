import { Clip, ClipSequence } from "../src/lib/clip"
import { seconds, useCurrentFrame } from "../src/lib/frame"
import { FillFrame } from "../src/lib/layout/fill-frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { Sound } from "../src/lib/sound/sound"
import { TimeLine } from "../src/lib/timeline"
import { Video } from "../src/lib/video/video"

export const PROJECT_SETTINGS: ProjectSettings = {
    name: "test-project",
    width: 1920,
    height: 1080,
    fps: 60,
}

export const PROJECT = () => {
    return (
        <Project>
            <TimeLine>
                <ClipSequence>
                    <Clip duration={seconds(1)}>
                        <Text />
                    </Clip>
                    <Clip>
                        <FillFrame>
                            <Video
                                video={"~/Videos/music.mp4"}
                                trim={{ from: seconds(1), duration: seconds(5) }}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </FillFrame>
                        <FillFrame>
                            <Text />
                        </FillFrame>
                    </Clip>
                </ClipSequence>
                <ClipSequence>
                    <Clip>
                        <Sound
                            sound={"~/Videos/music.mp3"}
                            trim={{ trimStart: seconds(1), trimEnd: seconds(1) }}
                        />
                    </Clip>
                </ClipSequence>
            </TimeLine>
        </Project>
    )
}

const Text = ({ text }: { text?: string }) => {
    const currentFrame = useCurrentFrame()

    return (
        <p style={{ color: "white" }}>Frame: {currentFrame} {text}</p>
    )
}
