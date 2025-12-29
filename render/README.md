# Render

Rust製のヘッドレスレンダリングエンジン。Chromiumでフレームをキャプチャし、FFmpegで動画にエンコードする。

## 技術スタック

- **言語**: Rust (Edition 2024)
- **ブラウザ制御**: Chromiumoxide 0.8
- **非同期ランタイム**: Tokio
- **動画エンコード**: FFmpeg

## ディレクトリ構成

```
render/
├── Cargo.toml      # パッケージマニフェスト
└── src/
    ├── main.rs     # レンダリングエンジン本体
    └── ffmpeg.rs   # FFmpeg連携モジュール
```

## 使用方法

```bash
render <width>:<height>:<fps>:<total_frames>:<workers>:<codec>:<preset>
```

### パラメータ

| パラメータ | 説明 |
|-----------|------|
| width | 出力幅 (px) |
| height | 出力高さ (px) |
| fps | フレームレート |
| total_frames | 総フレーム数 |
| workers | 並列ワーカー数 |
| codec | コーデック (`h264` / `h265`) |
| preset | エンコードプリセット (ultrafast〜veryslow) |

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `RENDER_PAGE_URL` | レンダーページURL (デフォルト: `http://localhost:5174/render`) |
| `RENDER_OUTPUT_PATH` | 出力ファイルパス |
| `RENDER_PROGRESS_URL` | 進捗コールバックエンドポイント |
| `RENDER_CANCEL_URL` | キャンセルチェックエンドポイント |
| `RENDER_AUDIO_PLAN_URL` | オーディオプランエンドポイント |
| `RENDER_RESET_URL` | 完了後リセットコールバック |
| `FRAMESCRIPT_CHROMIUM_PATH` | Chromium実行ファイルパス |
| `FRAMESCRIPT_FFMPEG_PATH` | FFmpeg実行ファイルパス |

## レンダリングパイプライン

1. **ブラウザプール起動**: N個のヘッドレスChromiumインスタンスを生成
2. **フレーム分割**: 総フレーム数をワーカー間で分割
3. **並列レンダリング**: 各ワーカーが担当フレームをキャプチャ
   - `window.__frameScript.setFrame(frame)` でフレーム設定
   - Canvas描画完了を待機
   - PNGスクリーンショット取得
   - FFmpegへパイプ
4. **セグメント出力**: 各ワーカーが `segment-XXX.mp4` を生成
5. **結合**: FFmpeg concatで単一MP4に結合
6. **オーディオミックス**: オーディオプランに基づき音声をミックス

## 主要機能

- **並列レンダリング**: 複数ワーカーによる高速化
- **リアルタイム進捗**: HTTP経由での進捗報告
- **キャンセル対応**: 1秒間隔でキャンセルシグナルをポーリング
- **オーディオミックス**: 複数音源の合成 (48kHz, AAC 192kbps)
- **H.264/H.265対応**: CRFベースの品質制御
