# Electron

Electronメインプロセス。デスクトップアプリケーションのウィンドウ管理、プロセス管理、IPCを担当する。

## 技術スタック

- **フレームワーク**: Electron 39
- **言語**: TypeScript
- **ビルドツール**: tsc (TypeScript Compiler)

## ディレクトリ構成

```
electron/
├── main.ts                    # メインプロセスエントリーポイント
├── render-settings-preload.ts # IPC preloadブリッジ
└── types.d.ts                 # 型定義
```

## 主要コンポーネント

### ウィンドウ管理

3種類のウィンドウを管理:

| ウィンドウ | サイズ | 用途 |
|-----------|--------|------|
| Main Window | 1280x720 | スタジオUI |
| Render Settings | 640x550 | レンダリング設定モーダル |
| Render Progress | 420x300 | 進捗表示モーダル |

### プロセス管理

- **Backend**: Rust製HTTPサーバー (`127.0.0.1:3000`)
- **Render**: Rust製レンダリングエンジン

開発モードでは `cargo run`、本番モードでは事前ビルド済みバイナリを使用。

### IPC API

`window.renderAPI` として公開:

- `getPlatform()` - プラットフォーム情報取得
- `getOutputPath()` - 出力パス取得
- `startRender(payload)` - レンダリング開始
- `openProgress()` - 進捗ウィンドウ表示

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `VITE_DEV_SERVER_URL` | 開発サーバーURL |
| `FRAMESCRIPT_RUN_MODE` | 実行モード (`dev` / `bin`) |
| `FRAMESCRIPT_PROJECT_ROOT` | プロジェクトルート |
| `FRAMESCRIPT_BACKEND_BIN` | バックエンドバイナリパス |
| `FRAMESCRIPT_RENDER_BIN` | レンダーバイナリパス |
| `FRAMESCRIPT_FFMPEG_PATH` | FFmpegパス |
| `FRAMESCRIPT_FFPROBE_PATH` | FFprobeパス |
| `FRAMESCRIPT_CHROMIUM_PATH` | Chromiumパス |
| `FRAMESCRIPT_OUTPUT_PATH` | 出力先パス |

## ビルド

```bash
# TypeScriptコンパイル
npm run build:electron
# 出力: dist-electron/main.js

# 開発モード
npm run dev:electron
```

## メニュー

- **File**: Render... (Cmd/Ctrl+R)
- **Debug**: DevTools、リロード
