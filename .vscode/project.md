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

## テスト戦略の更新

- コンポーネントテストは削除（維持コスト削減のため）。以後は以下で担保する:
  - ユニットテスト（Vitest）: ロジック・ユーティリティ・パーサ等
  - E2E（Playwright）: 画面遷移・レンダリング・ネットワークの統合
  - 必要に応じてルーティングや表示要素はE2Eで検証

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

## 検索UI（GitHubライク）

- 検索ボックスは GitHub ライクなクエリをサポートする
  - is:open / is:closed / is:all を解釈して state を変更する
  - author:`login` を解釈して author フィルターに反映する
  - 残りはフリーテキスト検索（タイトル/本文のクライアントサイドフィルタ）
- 既存の Author 入力欄がある場合は、同欄の値を優先（検索クエリ側の author は補助）
- 実装: `src/lib/searchParser.ts`（ユニットテスト: `src/lib/searchParser.test.ts`）を使用
- 互換性: is:issue / is:pr は無視（Issues API は PR を含むが、アプリ側で PR を除外しているため）
