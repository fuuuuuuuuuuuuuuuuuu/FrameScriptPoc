import { RUBY_SYMBOL, type RubyProps } from "./types"

/**
 * Voice コンポーネント内で使用する読み分離コンポーネント
 *
 * @example
 * ```tsx
 * <Voice>
 *   <Ruby reading="でもんすみす">刻まれし魔</Ruby>
 * </Voice>
 *
 * // テキストと混在も可能
 * <Voice>
 *   私の名は<Ruby reading="でもんすみす">刻まれし魔</Ruby>です
 * </Voice>
 * ```
 */
export function Ruby(_props: RubyProps): null {
  // このコンポーネントは直接レンダリングされない
  // Voice コンポーネントが children を解析して情報を抽出する
  return null
}

// マーカーを付与（Voice コンポーネントで識別するため）
;(Ruby as Record<symbol, boolean>)[RUBY_SYMBOL] = true
