# src

FrameScriptコアライブラリ。React/TypeScriptベースのビデオエディター・モーショングラフィックスSDK。

## 技術スタック

- **言語**: TypeScript 5.9
- **UIフレームワーク**: React 19
- **ルーティング**: React Router 6
- **ビルドツール**: Vite 7

## ディレクトリ構成

```
src/
├── main.tsx              # スタジオアプリエントリーポイント
├── StudioApp.tsx         # メインスタジオUIコンポーネント
├── lib/                  # コアライブラリ
│   ├── frame.tsx         # フレーム/タイムラインコンテキスト
│   ├── project.tsx       # プロジェクトコンテナ
│   ├── timeline.tsx      # タイムライン状態管理・クリップレジストリ
│   ├── clip.tsx          # クリップコンポーネント群
│   ├── animation.ts      # アニメーションシステム
│   ├── animation/
│   │   └── functions.ts  # イージング関数
│   ├── audio.ts          # オーディオ取得・デコード
│   ├── audio-plan.ts     # オーディオセグメント登録
│   ├── audio-waveform.ts # 波形解析
│   ├── studio-state.tsx  # 再生状態コンテキスト
│   ├── trim.ts           # トリムユーティリティ
│   ├── video/
│   │   ├── video.tsx     # ビデオコンポーネント
│   │   └── video-render.tsx
│   ├── sound/
│   │   └── sound.tsx     # サウンドコンポーネント
│   └── layout/
│       └── fill-frame.tsx
├── ui/                   # UIコンポーネント
│   ├── timeline.tsx      # タイムラインUI
│   ├── transport.tsx     # 再生コントロール
│   ├── render-settings.tsx
│   ├── render-progress.tsx
│   ├── clip-visibility.tsx
│   └── audio-waveform.tsx
├── render/
│   └── main.tsx          # ヘッドレスレンダラーエントリーポイント
└── util/
    ├── state.ts          # シンプルなStore実装
    └── promise.ts        # Promiseユーティリティ
```

## 主要コンポーネント

### クリップシステム (`lib/clip.tsx`)

| コンポーネント | 説明 |
|---------------|------|
| `ClipStatic` | 明示的なstart/endフレームを持つクリップ |
| `Clip` | 子要素から自動でdurationを算出 |
| `ClipSequence` | クリップを順番に配置 |
| `Serial` | ClipStaticを連続配置 |

### アニメーションシステム (`lib/animation.ts`)

```tsx
// 変数の作成
const x = useVariable(0);
const pos = useVariable(Vec2(0, 0));

// アニメーション定義 (async/await API)
useAnimation(async (anim) => {
  await anim(x).to(100).over(30);  // 30フレームで0→100
  await anim(pos).to(Vec2(100, 200)).over(60);
});
```

- `useVariable<T>()`: アニメーション可能な変数を作成
- `useAnimation()`: アニメーションシーケンスを定義
- イージング関数: `BEZIER_SMOOTH` など

### メディアコンポーネント

- **Video** (`lib/video/video.tsx`): 動画再生、シーク、トリム対応
- **Sound** (`lib/sound/sound.tsx`): Web Audio APIによるフレーム同期再生

### 状態管理 (`lib/studio-state.tsx`)

- `useIsPlaying()` / `useSetIsPlaying()`: 再生状態
- `useIsRender()`: スタジオモード/レンダリングモードの判定

## エントリーポイント

| ファイル | ポート | 用途 |
|---------|--------|------|
| `main.tsx` | 5173 | スタジオUI |
| `render/main.tsx` | 5174 | ヘッドレスレンダラー |

## ビルド

```bash
# スタジオUIビルド
npm run build:vite
# 出力: dist/

# レンダラービルド
npm run build:render
# 出力: dist-render/
```
