# project

ユーザープロジェクトディレクトリ。FrameScriptを使用してビデオを作成する場所。

## ディレクトリ構成

```
project/
├── project.tsx    # プロジェクト定義ファイル
├── sounds/        # サウンドファイル配置ディレクトリ
└── videos/        # ビデオファイル配置ディレクトリ
```

---

## ProjectSettings

プロジェクト全体の設定。`project.tsx` で `PROJECT_SETTINGS` としてエクスポート。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `name` | `string` | Yes | プロジェクト名 |
| `width` | `number` | Yes | 出力幅（px） |
| `height` | `number` | Yes | 出力高さ（px） |
| `fps` | `number` | Yes | フレームレート |

```tsx
export const PROJECT_SETTINGS: ProjectSettings = {
  name: "my-project",
  width: 1920,
  height: 1080,
  fps: 60,
}
```

---

## コンポーネント

### `<Project>`

プロジェクトのルートコンテナ。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `children` | `ReactNode` | Yes | 子要素（通常は`<TimeLine>`） |

```tsx
<Project>
  <TimeLine>...</TimeLine>
</Project>
```

---

### `<TimeLine>`

クリップの登録を管理し、Timeline UI に範囲を表示。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `children` | `ReactNode` | No | 子要素（`<Clip>`, `<ClipSequence>`等） |

```tsx
<TimeLine>
  <Clip label="Intro">...</Clip>
</TimeLine>
```

---

### `<Clip>`

子要素から長さを自動取得、または `duration` で明示指定するクリップ。

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|-----|------|-----------|------|
| `label` | `string` | No | - | タイムライン上の表示名 |
| `start` | `number` | No | `0` | 開始フレーム（親クリップ相対） |
| `duration` | `number` | No | 子要素から自動算出 | クリップの長さ（フレーム数） |
| `laneId` | `string` | No | - | レーンID（内部使用） |
| `children` | `ReactNode` | No | - | 子要素 |
| `onDurationChange` | `(frames: number) => void` | No | - | duration変更時コールバック |

```tsx
<Clip label="Intro" duration={seconds(3)}>
  <IntroScene />
</Clip>
```

---

### `<ClipStatic>`

明示的な start/end フレームを持つ静的クリップ。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `start` | `number` | Yes | 開始フレーム（親クリップ相対） |
| `end` | `number` | Yes | 終了フレーム（親クリップ相対） |
| `label` | `string` | No | タイムライン上の表示名 |
| `laneId` | `string` | No | レーンID（内部使用） |
| `children` | `ReactNode` | No | 子要素 |

```tsx
<ClipStatic start={0} end={119} label="Custom Range">
  <MyScene />
</ClipStatic>
```

---

### `<ClipSequence>`

複数の `<Clip>` を連結して1つのクリップのように扱う。

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|-----|------|-----------|------|
| `start` | `number` | No | `0` | シーケンス全体の開始フレーム |
| `children` | `ReactNode` | No | - | `<Clip>` 要素 |
| `onDurationChange` | `(frames: number) => void` | No | - | 合計duration変更時コールバック |

```tsx
<ClipSequence>
  <Clip label="A" duration={seconds(2)}>...</Clip>
  <Clip label="B" duration={seconds(3)}>...</Clip>
</ClipSequence>
```

---

### `<Serial>`

`<ClipStatic>` を直列配置するユーティリティ。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `children` | `ReactNode` | Yes | `<ClipStatic>` 要素 |

```tsx
<Serial>
  <ClipStatic start={0} end={59} label="A">...</ClipStatic>
  <ClipStatic start={0} end={29} label="B">...</ClipStatic>
</Serial>
```

---

### `<FillFrame>`

フレーム全体を覆う絶対配置コンテナ。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `children` | `ReactNode` | No | 子要素 |
| `style` | `CSSProperties` | No | 追加スタイル |

デフォルトスタイル: `position: absolute`, `inset: 0`, `display: flex`, `flexDirection: column`

```tsx
<FillFrame style={{ alignItems: "center", justifyContent: "center" }}>
  <div>中央配置</div>
</FillFrame>
```

---

## メディア

### `<Video>`

タイムライン上に動画を配置（音声付き）。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `video` | `string \| { path: string }` | Yes | 動画ファイルパス |
| `style` | `CSSProperties` | No | 追加スタイル |
| `trim` | `Trim` | No | トリム設定 |

```tsx
<Video video="assets/demo.mp4" />
<Video video={{ path: "assets/demo.mp4" }} trim={{ from: 30, duration: 120 }} />
```

#### `video_length(video)`

動画の長さをフレーム数で取得。

```tsx
const frames = video_length("assets/demo.mp4")
```

#### `video_fps(video)`

動画ソースのFPSを取得。

```tsx
const fps = video_fps("assets/demo.mp4")
```

---

### `<Sound>`

タイムライン上に音声トラックを配置。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `sound` | `string \| { path: string }` | Yes | 音声ファイルパス |
| `trim` | `Trim` | No | トリム設定 |

```tsx
<Sound sound="assets/music.mp3" />
<Sound sound={{ path: "assets/music.mp3" }} trim={{ trimStart: 30 }} />
```

#### `sound_length(sound)`

音声の長さをフレーム数で取得。

```tsx
const frames = sound_length("assets/music.mp3")
```

---

### `<Voice>`

VOICEVOX 音声再生と字幕表示を行うコンポーネント。

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|-----|------|-----------|------|
| `children` | `string \| ReactNode` | Yes | - | セリフテキストまたは `<Ruby>` を含む要素 |
| `speakerId` | `number` | No | `3` | VOICEVOX の話者 ID（デフォルト: ずんだもん ノーマル） |
| `params` | `AudioParams` | No | `{}` | 音声パラメータ |
| `subtitle` | `boolean \| string \| SubtitleConfig` | No | `true` | 字幕設定 |

```tsx
// 基本（デフォルト: ずんだもん ノーマル）
<Voice>こんにちわなのだ</Voice>

// 話者 ID と音声パラメータ指定
<Voice speakerId={2} params={{ speed: 1.2 }}>こんにちは</Voice>

// 字幕位置カスタマイズ
<Voice subtitle={{ position: "top" }}>こんにちわなのだ</Voice>

// 字幕なし
<Voice subtitle={false}>こんにちわなのだ</Voice>
```

#### AudioParams

音声生成パラメータ。

| 属性 | 型 | 説明 |
|------|-----|------|
| `speed` | `number` | 全体の話速 |
| `pitch` | `number` | 全体の音高 |
| `intonation` | `number` | 全体の抑揚 |
| `volume` | `number` | 全体の音量 |
| `prePhonemeLength` | `number` | 音声前の無音時間（秒） |
| `postPhonemeLength` | `number` | 音声後の無音時間（秒） |
| `pauseLength` | `number \| null` | 句読点などの無音時間（秒、null時は自動） |
| `pauseLengthScale` | `number` | 句読点などの無音時間の倍率 |
| `outputSamplingRate` | `number` | 出力サンプリングレート |
| `outputStereo` | `boolean` | ステレオ出力するか |

#### SubtitleConfig

字幕表示設定。

| 属性 | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `text` | `string` | children から取得 | 字幕テキスト |
| `position` | `"top" \| "center" \| "bottom"` | `"bottom"` | 字幕位置 |
| `style` | `CSSProperties` | `{}` | 追加スタイル |

---

### `<Ruby>`

`<Voice>` 内で表示テキストと読み上げテキストを分離するコンポーネント。

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| `children` | `string` | Yes | 表示テキスト（字幕に表示） |
| `reading` | `string` | Yes | 読み上げテキスト（音声生成に使用） |

```tsx
// 基本
<Voice>
  <Ruby reading="でもんすみす">刻まれし魔</Ruby>
</Voice>

// テキストと混在
<Voice>私の名は<Ruby reading="でもんすみす">刻まれし魔</Ruby>です</Voice>
```

字幕には「刻まれし魔」と表示され、音声は「でもんすみす」で生成される。

---

### Trim

トリム指定には2つの形式がある。

| 形式 | 属性 | 型 | 説明 |
|------|------|-----|------|
| 形式1 | `trimStart` | `number` | 先頭からカットするフレーム数 |
| | `trimEnd` | `number` | 末尾からカットするフレーム数 |
| 形式2 | `from` | `number` | 切り出し開始フレーム |
| | `duration` | `number` | 切り出すフレーム数 |

```tsx
// 形式1: 先頭30フレーム、末尾60フレームをカット
<Video video="demo.mp4" trim={{ trimStart: 30, trimEnd: 60 }} />

// 形式2: 30フレーム目から120フレーム分を使用
<Video video="demo.mp4" trim={{ from: 30, duration: 120 }} />
```

---

## アニメーション

### `useVariable<T>(initial)`

アニメーション可能な変数を作成。

| 引数 | 型 | 説明 |
|------|-----|------|
| `initial` | `number \| Vec2 \| Vec3` | 初期値 |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| `use()` | `() => T` | 現在フレームの値を取得（React Hook） |
| `get(frame)` | `(frame: number) => T` | 指定フレームの値を取得 |

```tsx
const opacity = useVariable(0)
const position = useVariable({ x: 0, y: 0 })
const pos3d = useVariable({ x: 0, y: 0, z: 0 })
```

---

### `useAnimation(run, deps)`

アニメーションシーケンスを定義。

| 引数 | 型 | 説明 |
|------|-----|------|
| `run` | `(ctx: AnimationContext) => Promise<void> \| void` | アニメーション定義関数 |
| `deps` | `DependencyList` | 依存配列 |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| `ready` | `boolean` | アニメーション計算完了フラグ |
| `durationFrames` | `number` | アニメーションの総フレーム数 |

#### AnimationContext

| メソッド | 説明 |
|---------|------|
| `ctx.move(variable).to(value, frames, easing?)` | 変数を指定値まで動かす |
| `ctx.sleep(frames)` | 指定フレーム数待機 |
| `ctx.parallel(handles[])` | 複数のアニメーションを並列実行 |

```tsx
const position = useVariable({ x: -300, y: 0 })
const opacity = useVariable(0)

const { ready } = useAnimation(async (ctx) => {
  // 並列実行
  const move = ctx.move(position).to({ x: 240, y: 0 }, seconds(1.2), BEZIER_SMOOTH)
  const fade = ctx.move(opacity).to(1, seconds(0.6), BEZIER_SMOOTH)
  await ctx.parallel([move, fade])

  // 順次実行
  await ctx.sleep(seconds(0.5))
  await ctx.move(opacity).to(0, seconds(0.3))
}, [])

if (!ready) return null

return (
  <div style={{
    opacity: opacity.use(),
    transform: `translate(${position.use().x}px, ${position.use().y}px)`,
  }} />
)
```

---

### イージング関数

`../src/lib/animation/functions` からインポート。

| 関数 | 説明 |
|------|------|
| `BEZIER_EASE` | CSS "ease" 相当 |
| `BEZIER_EASE_IN` | ease-in |
| `BEZIER_EASE_OUT` | ease-out |
| `BEZIER_EASE_IN_OUT` | ease-in-out |
| `BEZIER_SMOOTH` | なめらかな動き |
| `BEZIER_SHARP` | 切れ味のある動き |
| `BEZIER_ACCELERATE` | 加速 |
| `BEZIER_DECELERATE` | 減速 |
| `BEZIER_SNAPPY` | 俊敏な動き |
| `BEZIER_OVERSHOOT` | オーバーシュート |
| `BEZIER_OVERSHOOT_SOFT` | 柔らかいオーバーシュート |
| `BEZIER_OVERSHOOT_HARD` | 強めのオーバーシュート |
| `easeOutCubic` | cubic ease-out |
| `easeInOutCubic` | cubic ease-in-out |
| `easeOutExpo` | 指数関数 ease-out |

#### カスタムイージング

```tsx
import { cubicBezier } from "../src/lib/animation/functions"

const myEasing = cubicBezier(0.42, 0, 0.58, 1)
```

---

## ユーティリティ

### フレーム変換

```tsx
import { seconds, useCurrentFrame, useGlobalCurrentFrame } from "../src/lib/frame"

// 秒数→フレーム数
const frames = seconds(3.5)  // 3.5秒 × fps

// 現在フレーム取得
const localFrame = useCurrentFrame()       // Clip内相対フレーム
const globalFrame = useGlobalCurrentFrame() // プロジェクト絶対フレーム
```

### Clip情報取得

```tsx
import { useClipStart, useClipRange, useClipDepth, useClipActive } from "../src/lib/clip"

const start = useClipStart()      // クリップ開始フレーム
const range = useClipRange()      // { start, end }
const depth = useClipDepth()      // ネスト深度
const isActive = useClipActive()  // アクティブかつ表示中か
```

### アニメーション補助

```tsx
import { frameProgress, fadeInOut, stagger } from "../src/lib/animation/functions"

// フレーム進捗（0..1）
const t = frameProgress(frame, startFrame, endFrame, easing)

// フェードイン/アウト
const opacity = fadeInOut(frame, durationFrames)
const opacity2 = fadeInOut(frame, durationFrames, { in: 30, out: 30 })

// スタガー（連続アニメーションのオフセット）
const startOffset = stagger(index, seconds(0.1))
```

---

## 開発

```bash
npm run dev:vite    # http://localhost:5173 でプレビュー
```
