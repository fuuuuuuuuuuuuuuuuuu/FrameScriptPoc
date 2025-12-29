import type { CSSProperties } from "react"

/**
 * 音声パラメータ
 */
export interface AudioParams {
  /** 全体の話速 */
  speed?: number
  /** 全体の音高 */
  pitch?: number
  /** 全体の抑揚 */
  intonation?: number
  /** 全体の音量 */
  volume?: number
  /** 音声前の無音時間（秒） */
  prePhonemeLength?: number
  /** 音声後の無音時間（秒） */
  postPhonemeLength?: number
  /** 句読点などの無音時間（秒、null時は自動） */
  pauseLength?: number | null
  /** 句読点などの無音時間の倍率 */
  pauseLengthScale?: number
  /** 出力サンプリングレート */
  outputSamplingRate?: number
  /** ステレオ出力するか */
  outputStereo?: boolean
}

/**
 * 字幕設定
 */
export interface SubtitleConfig {
  /** 字幕テキスト */
  text?: string
  /** 字幕位置 */
  position?: "top" | "center" | "bottom"
  /** 追加スタイル */
  style?: CSSProperties
}

/**
 * Voice コンポーネントの props
 */
export interface VoiceProps {
  /** セリフテキスト */
  children: string
  /** 話者 ID（VOICEVOX の speaker ID） */
  speakerId?: number
  /** 音声パラメータ */
  params?: AudioParams
  /** 字幕設定 */
  subtitle?: boolean | string | SubtitleConfig
}

/**
 * Voice 情報収集用のエントリ（generate-voices で使用）
 */
export interface VoiceEntry {
  /** セリフテキスト */
  text: string
  /** 話者 ID */
  speakerId: number
  /** 音声パラメータ */
  params: AudioParams
  /** ソースファイルパス（デバッグ用） */
  file?: string
  /** ソースファイル行番号（デバッグ用） */
  line?: number
}

/**
 * voice-map.json のエントリ
 */
export interface VoiceMapEntry {
  /** ハッシュキー */
  key: string
  /** 音声ファイル ID (voice_001 形式) */
  id: string
  /** セリフテキスト */
  text: string
  /** 話者 ID */
  speakerId: number
  /** 音声パラメータ */
  params: AudioParams
  /** ソースファイルパス（デバッグ用） */
  file?: string
  /** ソースファイル行番号（デバッグ用） */
  line?: number
}

/**
 * voice-map.json の構造
 */
export interface VoiceMap {
  voices: VoiceMapEntry[]
}
