/**
 * generate-voices: VOICEVOX 音声ファイル生成スクリプト
 *
 * 実行フロー:
 * 1. VOICEVOX ENGINE 起動確認
 * 2. プロジェクトを SSR レンダリングして Voice 情報収集
 * 3. tmp ディレクトリに音声生成
 * 4. voice-map.json を tmp に生成
 * 5. 全て成功したら project/voices/ に移動
 */

import { renderToString } from "react-dom/server"
import fs from "node:fs/promises"
import path from "node:path"
import { createElement } from "react"

const VOICEVOX_URL = "http://localhost:50021"
const PROJECT_DIR = path.resolve(import.meta.dirname, "../project")
const VOICES_DIR = path.join(PROJECT_DIR, "voices")
const VOICE_MAP_PATH = path.join(PROJECT_DIR, "voice-map.json")
const TMP_DIR = path.resolve(import.meta.dirname, "../tmp/generate-voices")

// ============================================
// VOICEVOX ENGINE との通信
// ============================================

async function checkVoicevoxEngine(): Promise<void> {
  try {
    const res = await fetch(`${VOICEVOX_URL}/speakers`)
    if (!res.ok) {
      throw new Error(`VOICEVOX ENGINE returned ${res.status}`)
    }
    console.log("[generate-voices] VOICEVOX ENGINE is running")
  } catch {
    console.error(
      "[generate-voices] ERROR: VOICEVOX ENGINE is not running.\n" +
        "Start it with: docker compose -f docker/voicevox/docker-compose.yml up -d",
    )
    process.exit(1)
  }
}

interface AudioParams {
  speed?: number
  pitch?: number
  intonation?: number
  volume?: number
  prePhonemeLength?: number
  postPhonemeLength?: number
  pauseLength?: number | null
  pauseLengthScale?: number
  outputSamplingRate?: number
  outputStereo?: boolean
}

interface VoiceEntry {
  displayText: string
  text: string
  speakerId: number
  params: AudioParams
  file?: string
  line?: number
}

async function generateVoice(
  entry: VoiceEntry,
  outputPath: string,
): Promise<void> {
  const { text, speakerId, params } = entry

  // 1. AudioQuery 取得
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: "POST" },
  )
  if (!queryRes.ok) {
    throw new Error(`audio_query failed: ${queryRes.status}`)
  }
  const audioQuery = await queryRes.json()

  // 2. パラメータ上書き
  if (params.speed !== undefined) audioQuery.speedScale = params.speed
  if (params.pitch !== undefined) audioQuery.pitchScale = params.pitch
  if (params.intonation !== undefined)
    audioQuery.intonationScale = params.intonation
  if (params.volume !== undefined) audioQuery.volumeScale = params.volume
  if (params.prePhonemeLength !== undefined)
    audioQuery.prePhonemeLength = params.prePhonemeLength
  if (params.postPhonemeLength !== undefined)
    audioQuery.postPhonemeLength = params.postPhonemeLength
  if (params.pauseLength !== undefined)
    audioQuery.pauseLength = params.pauseLength
  if (params.pauseLengthScale !== undefined)
    audioQuery.pauseLengthScale = params.pauseLengthScale
  if (params.outputSamplingRate !== undefined)
    audioQuery.outputSamplingRate = params.outputSamplingRate
  if (params.outputStereo !== undefined)
    audioQuery.outputStereo = params.outputStereo

  // 3. 音声合成
  const synthesisRes = await fetch(
    `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audioQuery),
    },
  )
  if (!synthesisRes.ok) {
    throw new Error(`synthesis failed: ${synthesisRes.status}`)
  }

  // 4. ファイル保存
  const buffer = Buffer.from(await synthesisRes.arrayBuffer())
  await fs.writeFile(outputPath, buffer)
}

// ============================================
// Voice 情報収集
// ============================================

async function collectVoices(): Promise<VoiceEntry[]> {
  // 収集モードを有効化
  process.env.VOICE_COLLECT = "true"

  // Voice モジュールを動的インポート
  const { voiceRegistry, clearVoiceRegistry } = await import(
    "../src/lib/voice/index"
  )

  // レジストリをクリア（再実行時のため）
  clearVoiceRegistry()

  // プロジェクトと必要なコンテキストを動的インポート
  const { PROJECT } = await import("../project/project")
  const { WithCurrentFrame } = await import("../src/lib/frame")

  // SSR レンダリングで全 Voice を収集
  // WithCurrentFrame でラップすることで Clip が useGlobalCurrentFrame を使える
  renderToString(
    createElement(WithCurrentFrame, null, createElement(PROJECT)),
  )

  // 収集結果をコピーして返す
  const result = [...voiceRegistry]

  console.log(`[generate-voices] Collected ${result.length} voice entries`)

  return result
}

// ============================================
// voice-map.json 生成
// ============================================

// cyrb53 ハッシュ関数（voice-key.ts と同じ）
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return hash.toString(16).padStart(16, "0")
}

function stableStringify(obj: AudioParams): string {
  const sorted = Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = obj[key as keyof AudioParams]
        return acc
      },
      {} as Record<string, unknown>,
    )
  return JSON.stringify(sorted)
}

function generateVoiceKey(
  text: string,
  speakerId: number,
  params: AudioParams,
): string {
  const input = `${text}|${speakerId}|${stableStringify(params)}`
  return cyrb53(input)
}

interface VoiceMapEntry {
  key: string
  id: string
  displayText: string
  text: string
  speakerId: number
  params: AudioParams
  file?: string
  line?: number
}

function generateVoiceMap(registry: VoiceEntry[]): { voices: VoiceMapEntry[] } {
  const voices = registry.map((entry, index) => ({
    key: generateVoiceKey(entry.text, entry.speakerId, entry.params),
    id: `voice_${String(index + 1).padStart(3, "0")}`,
    displayText: entry.displayText,
    text: entry.text,
    speakerId: entry.speakerId,
    params: entry.params,
    file: entry.file,
    line: entry.line,
  }))

  return { voices }
}

// ============================================
// メイン処理
// ============================================

async function main(): Promise<void> {
  console.log("[generate-voices] Starting...")

  // 1. VOICEVOX ENGINE 起動確認
  await checkVoicevoxEngine()

  // 2. Voice 情報収集
  const voiceEntries = await collectVoices()

  if (voiceEntries.length === 0) {
    console.log("[generate-voices] No voices found. Nothing to generate.")
    return
  }

  // 3. tmp ディレクトリ準備
  await fs.rm(TMP_DIR, { recursive: true, force: true })
  await fs.mkdir(TMP_DIR, { recursive: true })

  // 4. 音声生成
  console.log(`[generate-voices] Generating ${voiceEntries.length} voice files...`)
  for (let i = 0; i < voiceEntries.length; i++) {
    const entry = voiceEntries[i]
    const id = `voice_${String(i + 1).padStart(3, "0")}`
    const outputPath = path.join(TMP_DIR, `${id}.wav`)

    process.stdout.write(
      `  [${i + 1}/${voiceEntries.length}] "${entry.text.slice(0, 20)}${entry.text.length > 20 ? "..." : ""}" (speaker: ${entry.speakerId})... `,
    )

    try {
      await generateVoice(entry, outputPath)
      console.log("OK")
    } catch (error) {
      console.log("FAILED")
      console.error(`    Error: ${error}`)
      console.error("[generate-voices] Aborting. Cleaning up tmp directory...")
      await fs.rm(TMP_DIR, { recursive: true, force: true })
      process.exit(1)
    }
  }

  // 5. voice-map.json 生成
  const voiceMap = generateVoiceMap(voiceEntries)
  const voiceMapTmpPath = path.join(TMP_DIR, "voice-map.json")
  await fs.writeFile(voiceMapTmpPath, JSON.stringify(voiceMap, null, 2))
  console.log("[generate-voices] Generated voice-map.json")

  // 6. 成功したら project/voices/ に移動
  console.log("[generate-voices] Moving files to project/voices/...")

  // project/voices/ をクリア
  await fs.rm(VOICES_DIR, { recursive: true, force: true })
  await fs.mkdir(VOICES_DIR, { recursive: true })

  // 音声ファイルを移動
  const files = await fs.readdir(TMP_DIR)
  for (const file of files) {
    if (file.endsWith(".wav")) {
      await fs.rename(path.join(TMP_DIR, file), path.join(VOICES_DIR, file))
    }
  }

  // voice-map.json を移動
  await fs.rename(voiceMapTmpPath, VOICE_MAP_PATH)

  // tmp ディレクトリを削除
  await fs.rm(TMP_DIR, { recursive: true, force: true })

  console.log("[generate-voices] Done!")
  console.log(`  Generated ${voiceEntries.length} voice files in project/voices/`)
}

main().catch((error) => {
  console.error("[generate-voices] Fatal error:", error)
  process.exit(1)
})
