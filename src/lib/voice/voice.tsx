import type { CSSProperties, ReactNode } from "react"
import { isValidElement, Children } from "react"
import { Sound } from "../sound/sound"
import { FillFrame } from "../layout/fill-frame"
import { generateVoiceKey } from "./voice-key"
import {
  RUBY_SYMBOL,
  type SubtitleConfig,
  type VoiceProps,
  type VoiceEntry,
  type VoiceMap,
  type RubyProps,
} from "./types"
import voiceMapData from "../../../project/voice-map.json"

const voiceMap = voiceMapData as VoiceMap

// 起動時に Map 化（O(1) ルックアップ）
const voiceLookup = new Map(voiceMap.voices.map((v) => [v.key, v]))

// ============================================
// Voice 収集モード（generate-voices で使用）
// ============================================

/**
 * Voice 情報収集用のレジストリ
 */
export const voiceRegistry: VoiceEntry[] = []

/**
 * 収集モードかどうかを判定
 * Node.js 環境でのみ process.env を参照
 */
export function isCollectMode(): boolean {
  return typeof process !== "undefined" && process.env?.VOICE_COLLECT === "true"
}

/**
 * レジストリをクリア
 */
export function clearVoiceRegistry(): void {
  voiceRegistry.length = 0
}

/**
 * 呼び出し元のファイルパスと行番号を取得
 */
function getCallerLocation(): { file?: string; line?: number } {
  const stack = new Error().stack
  if (!stack) return {}

  const lines = stack.split("\n")

  // Voice コンポーネントの呼び出し元を探す（3行目以降）
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i]
    // project/ 配下のファイルを探す
    const match = line.match(/\((.+?):(\d+):\d+\)$/)
    if (match && match[1].includes("project/")) {
      return {
        file: match[1].replace(/^.*\/project\//, "project/"),
        line: parseInt(match[2], 10),
      }
    }
  }

  return {}
}

/**
 * children を解析して表示テキストと読み上げテキストを抽出
 */
interface ParsedVoiceContent {
  displayText: string // 字幕表示用
  readingText: string // 音声生成用
}

function parseVoiceChildren(children: string | ReactNode): ParsedVoiceContent {
  // Case 1: 単純な文字列（後方互換）
  if (typeof children === "string") {
    return { displayText: children, readingText: children }
  }

  // Case 2: ReactNode を解析
  const displayParts: string[] = []
  const readingParts: string[] = []

  const processNode = (node: ReactNode): void => {
    if (typeof node === "string") {
      displayParts.push(node)
      readingParts.push(node)
    } else if (typeof node === "number") {
      const str = String(node)
      displayParts.push(str)
      readingParts.push(str)
    } else if (isValidElement(node)) {
      // Ruby コンポーネントかチェック
      if ((node.type as Record<symbol, boolean>)?.[RUBY_SYMBOL]) {
        const props = node.props as RubyProps
        displayParts.push(props.children)
        readingParts.push(props.reading)
      } else {
        console.warn("[Voice] Unknown child element type:", node.type)
      }
    } else if (Array.isArray(node)) {
      node.forEach(processNode)
    }
  }

  Children.toArray(children).forEach(processNode)

  return {
    displayText: displayParts.join(""),
    readingText: readingParts.join(""),
  }
}

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
  // children を解析して表示テキストと読み上げテキストを分離
  const { displayText, readingText } = parseVoiceChildren(children)

  // 収集モードの場合はレジストリに登録して終了
  if (isCollectMode()) {
    const { file, line } = getCallerLocation()
    voiceRegistry.push({ displayText, text: readingText, speakerId, params, file, line })
    return null
  }

  // 通常モード: 音声再生・字幕表示
  const key = generateVoiceKey(readingText, speakerId, params)
  const entry = voiceLookup.get(key)

  if (!entry) {
    console.error(
      `[Voice] Audio not found: "${readingText}" (speakerId: ${speakerId}). Run 'npm run generate-voices' to generate.`,
    )
    return null
  }

  const audioPath = `project/voices/${entry.id}.wav`
  // 字幕には表示テキストを使用
  const subtitleConfig = normalizeSubtitle(subtitle, displayText)

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
