## パッケージマネージャーについて

- npmコマンドを使用する（pnpmではなく）

## Vite環境変数

- ブラウザ環境では`process.env`は使用できない
- Viteでは`import.meta.env`を使用する
- 環境変数には`VITE_`プレフィックスが必要

## Tailwind CSS v4

- Viteプラグイン（`@tailwindcss/vite`）を使用する場合、`postcss.config.js`は不要
- `autoprefixer`と`postcss`の依存関係も不要（Viteプラグインに含まれる）
- `tailwind.config.js`ではプラグインの設定ではなく、`content`設定のみ必要
- `src/index.css`では`@import "tailwindcss";`を一度だけ記述
- npmを使用する場合、pnpmのlock fileとnode_modulesを削除してから再インストール

## Playwright Component Testing

- Playwrightでのコンポーネントテストでは、GitHub API用のdevサーバーを立ち上げる
- モックサーバーを使用して実際のGitHub APIをシミュレートする
- テスト環境では`getIssues()`等の関数が自動的にモックサーバーからデータを取得する

## コンポーネント分割方針（Container / Presentational）

- データ取得や副作用は Container コンポーネントに集約する
- UI は Presentational コンポーネント（UI-only）に切り出す
- 既存のエクスポートは可能な限り維持しつつ、UI は `*UI.tsx` の命名で配置する
- コンポーネントテストでは UI コンポーネントを直接マウントしてスナップショットを取る
