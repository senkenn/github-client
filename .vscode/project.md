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

## TanStack Router ルーティング方針（issues）

- 親: `src/routes/issues.tsx`
  - 役割: 共有レイアウト（タイトル、`<Outlet />`）と `validateSearch`（`owner`, `repo`）を定義し、子に共有する
- インデックス: `src/routes/issues.index.tsx`
  - 役割: `/issues` の一覧表示（`IssuesList` を描画）
- 子詳細: `src/routes/issues.$issueNumber.tsx`
  - 役割: `/issues/:issueNumber` の詳細表示

原則: 子ルートがある場合は親（`issues.tsx`）を残し、レイアウトと検索バリデーションは親で共有する。

DRY: インデックスや子ルートでは検索バリデーションを重複させない。`IssuesRoute.useSearch()` で親の検証済み値を参照する。

## テスト方針（routing）

- ファイル内容の文字列一致でルーティング修正を検証するユニットテストは廃止（脆弱・リファクタで壊れやすい）
- 代替として Playwright E2E を追加
  - `/issues?owner=...&repo=...` で一覧を表示（`data-testid="issue-item"` を 2 件想定）
  - `/issues/:number?owner=...&repo=...` で詳細を表示（h1 に `#<number> <title>` が出る）
- ネットワークは `api.github.com` の該当エンドポイントを `page.route` でモックし、安定化する
