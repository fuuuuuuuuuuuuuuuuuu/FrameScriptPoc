## Instructions for AI agents

This project is a bundle of the FrameScript video editor & motion graphics tool and its project.
The files the user should mainly edit are in the `project/` directory and `project/project.tsx`, while the FrameScript core and libraries are in `src/`.
Please read the code under `src/` carefully and comprehensively.
As a rule, it is preferable not to edit code under `src/` except for contributing to FrameScript. (If the user explicitly wants edits, follow that.)

## コーディングルール

- `Clip` コンポーネントは `TimeLine` 内に直接書かず、`HelloScene` と同じように `const HelloClip = () => <Clip ...>` のようなコンポーネントを宣言してから読み込むこと。
- 原則として `Clip` は映像やテキストごとに個別のコンポーネントとして分け、`TimeLine` 上で単体 ON/OFF できるようにまとめず配置すること（UI での確認を容易にするため）。
