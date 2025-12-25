import { Clip } from "../src/lib/clip"
import { seconds } from "../src/lib/frame"
import { FillFrame } from "../src/lib/layout/fill-frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"
import { useAnimation, useVariable } from "../src/lib/animation"
import { BEZIER_SMOOTH } from "../src/lib/animation/functions"

export const PROJECT_SETTINGS: ProjectSettings = {
  name: "framescript-motion-demo",
  width: 1920,
  height: 1080,
  fps: 60,
}

const CircleScene = () => {
  // 位置と不透明度をアニメーション可能な変数として保持
  const position = useVariable({ x: -300, y: 0 })
  const opacity = useVariable(0)

  const { ready } = useAnimation(async (ctx) => {
    // 同時に動かしたい処理は handle を作って並列で待つ
    const move = ctx.move(position).to({ x: 240, y: 0 }, seconds(1.2), BEZIER_SMOOTH)
    const fade = ctx.move(opacity).to(1, seconds(0.6), BEZIER_SMOOTH)
    await ctx.parallel([move, fade])
  }, [])

  // 事前計算が終わるまで描画しない
  if (!ready) return null

  // 現在フレームに対応した値を取得
  const pos = position.use()

  return (
    <FillFrame style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "999px",
          background: "#38bdf8",
          opacity: opacity.use(),
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          boxShadow: "0 20px 60px rgba(56,189,248,0.35)",
        }}
      />
    </FillFrame>
  )
}

export const PROJECT = () => {
  return (
    <Project>
      <TimeLine>
        <Clip label="Circle">
          <CircleScene />
        </Clip>
      </TimeLine>
    </Project>
  )
}
