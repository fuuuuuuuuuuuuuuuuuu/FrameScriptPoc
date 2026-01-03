---
title: CLI レンダリング
sidebar_position: 5
---

GUI を使わずにコマンドラインから動画をレンダリングする方法。

## 前提条件

- Node.js
- Rust ツールチェーン（バイナリビルド用）
- FFmpeg
- Chromium

## バイナリのビルド

まず、backend と render のバイナリをビルドします:

```bash
npm run build:all
npm run build:binaries
```

`bin/<platform>/` にプラットフォーム固有のバイナリが生成されます:
- `backend` - 動画/音声処理用 HTTP サーバー
- `render` - ヘッドレスレンダリングエンジン

## レンダリングフロー

CLI レンダリングには3つのコンポーネントが必要です:

1. **Backend サーバー** - 動画メタデータと音声プラン API を提供
2. **Render ページ** - フレームキャプチャ用の React プロジェクトを配信
3. **Render バイナリ** - フレームをキャプチャし動画をエンコード

### ステップ 1: Backend の起動

```bash
# プロジェクトルートを設定
export FRAMESCRIPT_PROJECT_ROOT=$(pwd)

# Backend サーバーを起動（127.0.0.1:3000 で待ち受け）
./bin/linux-x86_64/backend
```

### ステップ 2: Render ページのビルドと配信

```bash
# Render ページをビルド
npm run build:render

# ビルドしたファイルを配信（任意の静的サーバーで）
# Render ページは http://localhost:5174/render でアクセス可能にする
```

または Vite 開発サーバーを使用:

```bash
npm run dev:render
```

### ステップ 3: Render バイナリの実行

```bash
export RENDER_PAGE_URL="http://localhost:5174/render"
export RENDER_OUTPUT_PATH="./output.mp4"

./bin/linux-x86_64/render <width>:<height>:<fps>:<total_frames>:<workers>:<codec>:<preset>
```

#### パラメータ

| パラメータ | 説明 |
|-----------|------|
| `width` | 出力幅（ピクセル） |
| `height` | 出力高さ（ピクセル） |
| `fps` | フレームレート |
| `total_frames` | レンダリングする総フレーム数 |
| `workers` | 並列ワーカー数（Chromium インスタンス数） |
| `codec` | 動画コーデック（`h264` または `h265`） |
| `preset` | エンコードプリセット（`ultrafast`, `fast`, `medium`, `slow`, `veryslow`） |

#### 使用例

1920x1080、60fps、300フレーム（5秒）、4ワーカーでレンダリング:

```bash
./bin/linux-x86_64/render 1920:1080:60:300:4:h264:medium
```

## 環境変数

### Backend

| 変数 | 説明 |
|------|------|
| `FRAMESCRIPT_PROJECT_ROOT` | プロジェクトルートディレクトリ |
| `FRAMESCRIPT_FFMPEG_PATH` | FFmpeg バイナリのパス |
| `FRAMESCRIPT_FFPROBE_PATH` | FFprobe バイナリのパス |

### Render

| 変数 | 説明 |
|------|------|
| `RENDER_PAGE_URL` | Render ページの URL |
| `RENDER_OUTPUT_PATH` | 出力ファイルパス（デフォルト: `output.mp4`） |
| `RENDER_PROGRESS_URL` | 進捗コールバックエンドポイント |
| `RENDER_CANCEL_URL` | キャンセルチェックエンドポイント |
| `RENDER_AUDIO_PLAN_URL` | 音声プランエンドポイント |
| `FRAMESCRIPT_CHROMIUM_PATH` | Chromium 実行ファイルのパス |
| `FRAMESCRIPT_FFMPEG_PATH` | FFmpeg バイナリのパス |

## 一括実行スクリプト

便利な shell スクリプトの例:

```bash
#!/bin/bash

# 設定
WIDTH=1920
HEIGHT=1080
FPS=60
TOTAL_FRAMES=300
WORKERS=4
CODEC=h264
PRESET=medium

export FRAMESCRIPT_PROJECT_ROOT=$(pwd)
export RENDER_OUTPUT_PATH="./output.mp4"

# Backend をバックグラウンドで起動
./bin/linux-x86_64/backend &
BACKEND_PID=$!

# Backend の起動を待つ
sleep 2

# Render 開発サーバーをバックグラウンドで起動
npm run dev:render &
RENDER_PID=$!

# Render サーバーの起動を待つ
sleep 3

export RENDER_PAGE_URL="http://localhost:5174/render"

# レンダリング実行
./bin/linux-x86_64/render ${WIDTH}:${HEIGHT}:${FPS}:${TOTAL_FRAMES}:${WORKERS}:${CODEC}:${PRESET}

# クリーンアップ
kill $BACKEND_PID $RENDER_PID 2>/dev/null
```

## レンダリングパイプライン

1. **ブラウザプール起動**: N 個のヘッドレス Chromium インスタンスを生成
2. **フレーム分割**: 総フレーム数をワーカー間で分割
3. **並列キャプチャ**: 各ワーカーが担当フレームをキャプチャ
   - `window.__frameScript.setFrame(frame)` でフレーム設定
   - Canvas 描画完了を待機
   - PNG スクリーンショット取得
   - FFmpeg へパイプ
4. **セグメント出力**: 各ワーカーが `segment-XXX.mp4` を生成
5. **結合**: FFmpeg concat で単一 MP4 に結合
6. **オーディオミックス**: 音声プランに基づき音声をミックス（48kHz AAC 192kbps）

## 対応コーデック

| コーデック | 説明 |
|-----------|------|
| `h264` | H.264/AVC - 広い互換性 |
| `h265` | H.265/HEVC - 高圧縮率 |

## プリセット

高速プリセット = ファイルサイズ大、エンコード高速
低速プリセット = ファイルサイズ小、エンコード低速

| プリセット | 速度 | 品質 |
|-----------|------|------|
| `ultrafast` | 最速 | 最低 |
| `fast` | 高速 | 低 |
| `medium` | バランス | バランス |
| `slow` | 低速 | 高 |
| `veryslow` | 最遅 | 最高 |
