import type { AudioParams } from "./types"

/**
 * オブジェクトをキー順にソートして JSON 文字列化
 * 同じ内容のオブジェクトが順序違いで異なるハッシュになるのを防ぐ
 */
export function stableStringify(obj: AudioParams): string {
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

/**
 * シンプルなハッシュ関数（cyrb53）
 * 高速で衝突が少なく、ブラウザで同期的に動作する
 * @see https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
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
  // 53-bit hash as hex string (16 chars)
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return hash.toString(16).padStart(16, "0")
}

/**
 * Voice コンポーネント用のハッシュキーを生成
 * text + speakerId + params の組み合わせから一意のキーを生成
 */
export function generateVoiceKey(
  text: string,
  speakerId: number,
  params: AudioParams,
): string {
  const input = `${text}|${speakerId}|${stableStringify(params)}`
  return cyrb53(input)
}
