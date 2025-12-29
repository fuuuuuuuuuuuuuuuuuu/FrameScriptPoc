# Backend

Rust製の高性能ビデオサーバー。フレーム抽出、メタデータ取得、ストリーミングAPIを提供する。

## 技術スタック

- **言語**: Rust (Edition 2024)
- **Webフレームワーク**: Axum 0.8
- **非同期ランタイム**: Tokio
- **外部ツール**: FFmpeg / FFprobe

## ディレクトリ構成

```
backend/
├── Cargo.toml          # パッケージマニフェスト
└── src/
    ├── main.rs         # HTTPサーバーとAPIエンドポイント
    ├── decoder.rs      # フレームキャッシュとデコード管理
    ├── future.rs       # SharedManualFuture実装
    ├── util.rs         # パス解決ユーティリティ
    └── ffmpeg/
        ├── mod.rs      # FFmpegモジュール宣言とプローブ関数
        ├── bin.rs      # FFmpeg/FFprobeバイナリパス解決
        ├── command.rs  # FFmpegプロセス実行
        ├── hw_decoder.rs  # ハードウェアアクセラレーション
        └── sw_decoder.rs  # ソフトウェアデコードフォールバック
```

## APIエンドポイント

サーバーは `127.0.0.1:3000` で起動する。

### ストリーミング
- `GET /video?path=<path>` - HTTPレンジリクエスト対応の動画配信
- `GET /audio?path=<path>` - HTTPレンジリクエスト対応の音声配信

### メタデータ
- `GET /video/meta?path=<path>` - 動画メタデータ (duration_ms, fps)
- `GET /audio/meta?path=<path>` - 音声メタデータ (duration_ms)

### フレーム抽出 (WebSocket)
- `GET /ws` - リアルタイムフレーム抽出
  - リクエスト: `{"video": "<path>", "width": <u32>, "height": <u32>, "frame": <u32>}`
  - レスポンス: RGBAバイナリデータ

### レンダリング制御
- `POST/GET /render_progress` - 進捗追跡
- `POST /render_cancel` - レンダリングキャンセル
- `GET /is_canceled` - キャンセル状態確認
- `GET /render_audio_plan` - オーディオプラン取得
- `POST /render_audio_plan` - オーディオプラン設定

### 管理
- `POST /set_cache_size` - キャッシュサイズ設定 (1-128 GiB)
- `POST /reset` - デコーダキャッシュクリア
- `GET /healthz` - ヘルスチェック

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `FRAMESCRIPT_FFMPEG_PATH` | FFmpeg実行ファイルパス |
| `FRAMESCRIPT_FFPROBE_PATH` | FFprobe実行ファイルパス |
| `FRAMESCRIPT_PROJECT_ROOT` | プロジェクトルートディレクトリ |

## 主要機能

- **インテリジェントキャッシュ**: LRU方式のフレームキャッシュ (デフォルト4GiB)
- **バッチデコード**: 120フレーム単位での効率的なデコード
- **ハードウェアアクセラレーション**: AMD Radeon対応 (radeonsi)、失敗時はソフトウェアフォールバック
