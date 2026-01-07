# MinCaml in TypeScript

## プロジェクトの目的

- TypeScript の上達
- プログラミング言語の仕組みを理解する
- 型システムの実装を学ぶ
- MinCaml を理解する

## 学習者のバックグラウンド

- CS 専攻ではない（電気系）
- TypeScript で Web サービス開発経験あり

## 進め方

- 理論を学ぶ → 自分で考えて実装 → 詰まったら参考実装を見る
- 各フェーズで理論的背景も学ぶ
- 写経も OK だが、できれば自分で考えながら進める
- TDD で進める。

## マイルストーン

### フェーズ 1: 基礎

1. **四則演算の電卓** - 字句解析・構文解析・評価の基本 ✅
2. **変数と let 式** - 環境（スコープ）の概念 ✅
3. **条件分岐（if）と比較演算** - 制御フロー ✅

### フェーズ 2: 関数

4. **関数定義と呼び出し** - let rec、再帰の仕組み ✅
5. **型推論** - Hindley-Milner 型推論（ML の心臓部） ✅

### フェーズ 3: データ構造

6. **タプルと配列** - 複合データ型

### フェーズ 4: 中間表現と変換

7. **K 正規化** - 中間表現への変換
8. **クロージャ変換** - 自由変数の扱い

### フェーズ 5: コード生成（ゴール未定）

9. **コード生成** - インタプリタ? JS 出力? WASM?

### 発展（興味があれば）

- パターンマッチ
- エラーメッセージ改善
- REPL（対話環境）
- 最適化（定数畳み込み、インライン展開）

## 記事の方針

- Zenn に記事を書きながら進める（学習メモも兼ねる）
- コンポーネント単位で 1 記事にまとめる
  - 例: 字句解析、構文解析、評価器、型推論...など

## 参考資料

- オリジナル MinCaml: https://esumii.github.io/min-caml/

---

## Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```
