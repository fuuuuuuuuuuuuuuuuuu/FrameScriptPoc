import type { CSSProperties } from "react"
import { Sound } from "../sound/sound"
import { FillFrame } from "../layout/fill-frame"
import { generateVoiceKey } from "./voice-key"
import type {
  AudioParams,
  SubtitleConfig,
  VoiceProps,
  VoiceMap,
} from "./types"
import voiceMapData from "../../../project/voice-map.json"

const voiceMap = voiceMapData as VoiceMap

// 起動時に Map 化（O(1) ルックアップ）
const voiceLookup = new Map(voiceMap.voices.map((v) => [v.key, v]))

/**
 * 字幕設定を正規化
 */
function normalizeSubtitle(
  subtitle: boolean | string | SubtitleConfig | undefined,
  defaultText: string,
): {
  text: string
  position: "top" | "center" | "bottom"
  style: CSSProperties
} | null {
  if (subtitle === false) return null
  if (subtitle === true || subtitle === undefined) {
    return { text: defaultText, position: "bottom", style: {} }
  }
  if (typeof subtitle === "string") {
    return { text: subtitle, position: "bottom", style: {} }
  }
  return {
    text: subtitle.text ?? defaultText,
    position: subtitle.position ?? "bottom",
    style: subtitle.style ?? {},
  }
}

// position に応じた基本スタイル
const positionStyles: Record<
  "top" | "center" | "bottom",
  CSSProperties
> = {
  top: { top: "10%" },
  center: { top: "50%", transform: "translateX(-50%) translateY(-50%)" },
  bottom: { bottom: "10%" },
}

/**
 * VOICEVOX 音声再生コンポーネント
 *
 * @example
 * ```tsx
 * // 基本（デフォルト: ずんだもん ノーマル = 3）
 * <Voice>こんにちわなのだ</Voice>
 *
 * // 話者 ID 指定（四国めたん ノーマル = 2）
 * <Voice speakerId={2} params={{ speed: 1.2 }}>
 *   こんにちは
 * </Voice>
 *
 * // 字幕カスタマイズ
 * <Voice subtitle={{ position: 'top' }}>こんにちわなのだ</Voice>
 *
 * // 字幕なし
 * <Voice subtitle={false}>こんにちわなのだ</Voice>
 * ```
 */
export function Voice({
  children,
  speakerId = 3, // ずんだもん ノーマル
  params = {},
  subtitle = true,
}: VoiceProps) {
  const text = children
  const key = generateVoiceKey(text, speakerId, params)

  const entry = voiceLookup.get(key)

  if (!entry) {
    console.error(
      `[Voice] Audio not found: "${text}" (speakerId: ${speakerId}). Run 'npm run generate-voices' to generate.`,
    )
    return null
  }

  const audioPath = `project/voices/${entry.id}.wav`
  const subtitleConfig = normalizeSubtitle(subtitle, text)

  return (
    <>
      <Sound sound={audioPath} />
      {subtitleConfig && (
        <FillFrame>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              textAlign: "center",
              color: "white",
              fontSize: "48px",
              textShadow: "2px 2px 4px black",
              ...positionStyles[subtitleConfig.position],
              ...subtitleConfig.style,
            }}
          >
            {subtitleConfig.text}
          </div>
        </FillFrame>
      )}
    </>
  )
}
