import { VideoCanvas } from "../src/gpu/video"
import { Clip, ClipSequence } from "../src/lib/clip"
import { seconds, useCurrentFrame } from "../src/lib/frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"

export const PROJECT_SETTINGS: ProjectSettings = {
    name: "test-project",
    width: 1920,
    height: 1080,
    fps: 60,
}

const TEST_VIDEO = { path: "~/Videos/1080p.mp4" }

export const PROJECT = () => {
    return (
        <Project>
            <TimeLine>
                <Clip duration={seconds(3)} label="Clip1">
                    <Text />
                </Clip>
                <ClipSequence>
                    <ClipSequence>
                        <Clip>
                            <VideoCanvas video={TEST_VIDEO} style={{ width: "100%", height: "100%" }} />
                        </Clip>
                        <Clip duration={seconds(3)}>
                            <Text />
                        </Clip>
                    </ClipSequence>
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
