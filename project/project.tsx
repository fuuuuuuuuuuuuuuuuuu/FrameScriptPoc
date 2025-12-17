import { Clip, ClipSequence } from "../src/lib/clip"
import { seconds, useCurrentFrame } from "../src/lib/frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"
import { Video } from "../src/lib/video/video"

export const PROJECT_SETTINGS: ProjectSettings = {
    name: "test-project",
    width: 1920,
    height: 1080,
    fps: 60,
}

const TEST_VIDEO = { path: "~/Videos/music.mp4" }

export const PROJECT = () => {
    return (
        <Project>
            <TimeLine>
                <ClipSequence>
                    <Clip duration={seconds(1)}>
                        <Text />
                    </Clip>
                    <Clip>
                        <Video video={TEST_VIDEO} trimStart={seconds(1)} trimEnd={seconds(1)} style={{ width: "100%", height: "100%" }} />
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
