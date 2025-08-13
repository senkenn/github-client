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

## Issue/Comment 編集ポリシー

- Issue 本文更新: `PATCH /repos/{owner}/{repo}/issues/{issue_number}`
- コメント更新: `PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}`
- フロント: 楽観的更新 → 失敗時リフェッチでロールバック
- TiptapEditor: `data-testid="tiptap-editor"` を付与し E2E セレクタ安定化
- E2E: 1 ファイル `tests/issueEditing.spec.ts` 内で本文編集/コメント編集を独立テスト化（相互依存なし）

## 検索UI（GitHubライク）

- 検索ボックスは GitHub ライクなクエリをサポートする
  - is:open / is:closed / is:all を解釈して state を変更する
  - author:`login` を解釈して author フィルターに反映する
  - 残りはフリーテキスト検索（タイトル/本文のクライアントサイドフィルタ）
- 既存の Author 入力欄がある場合は、同欄の値を優先（検索クエリ側の author は補助）
- 実装: `src/lib/searchParser.ts`（ユニットテスト: `src/lib/searchParser.test.ts`）を使用
- 互換性: is:issue / is:pr は無視（Issues API は PR を含むが、アプリ側で PR を除外しているため）

## E2E テスト監査 (2025-08-13)

現状ファイル:

- `tests/routing.spec.ts`: 一覧表示 / 詳細表示（OK, スモーク）
- `tests/localStorage.spec.ts`: 入力保存系4コアケース
- `tests/issueEditing.spec.ts`: 本文編集 / コメント編集（PATCH 検証含む, 単一ファイル統合）

重複/冗長指摘:

- localStorage:
  - 既に 4 コアケース（初回保存 / リロード復元 / 空状態 / 既存値プレロード）に縮約済み。
  - 文字入力逐次保存・疑似セッション維持テストは削除。

カバレッジ不足候補:

- 検索パーサ統合: is:open / is:closed / author:foo クエリがリスト結果に反映される E2E が無い。
- フリーテキスト検索フィルタ（タイトル・本文両方）
- Issue/Comment 編集失敗時ロールバック（PATCH 500 -> UI が元に戻る）
- 編集キャンセル（内容変更後 Cancel で元に戻る）
- Markdown 重要ケース: コードブロック / テーブル / ネストリスト保持（変換ロスがないこと）
- コメント 0 件ケース（"No comments yet." の表示）既に UI あるが routing テストでは未検証。

改善提案（優先度順）:

1. 検索統合テスト追加（state + author + keyword を1ファイルに）
2. 編集失敗ロールバック（PATCH を 500 返却 & 再フェッチ経路検証）
3. キャンセル動作テスト（内容変更→Cancel→元本文）
4. localStorage テスト整理（重複削除）
5. Markdown ラウンドトリップ簡易スモーク（挿入 -> Save -> HTML 上に期待断片）
6. No comments ケース検証（コメント 0 API 応答）

低コスト抽象化:

- 繰り返し出る GitHub API ルーティングモックを util 化（`tests/utils/githubMock.ts`）し、`mockIssue`, `mockComments`, `mockPatchIssue`, `mockPatchComment` ヘルパーで記述量削減。

維持ポリシー案:

- 目的が重複するテストは「最も読みやすい1つ」に統合。
- 速度監視: 将来テスト増加時は smoke セットと full セットを npm script で分離（例: `test:e2e:smoke`）。
