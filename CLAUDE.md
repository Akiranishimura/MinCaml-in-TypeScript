# MinCaml in TypeScript

## プロジェクトの目的
- TypeScriptの上達
- プログラミング言語の仕組みを理解する
- 型システムの実装を学ぶ
- MinCamlを理解する

## 学習者のバックグラウンド
- CS専攻ではない（電気系）
- TypeScriptでWebサービス開発経験あり

## 進め方
- 理論を学ぶ → 自分で考えて実装 → 詰まったら参考実装を見る
- 各フェーズで理論的背景も学ぶ
- 写経もOKだが、できれば自分で考えながら進める

## マイルストーン

### フェーズ1: 基礎
1. **四則演算の電卓** - 字句解析・構文解析・評価の基本
2. **変数と let 式** - 環境（スコープ）の概念
3. **条件分岐（if）と比較演算** - 制御フロー

### フェーズ2: 関数
4. **関数定義と呼び出し** - let rec、再帰の仕組み
5. **型推論** - Hindley-Milner型推論（MLの心臓部）

### フェーズ3: データ構造
6. **タプルと配列** - 複合データ型

### フェーズ4: 中間表現と変換
7. **K正規化** - 中間表現への変換
8. **クロージャ変換** - 自由変数の扱い

### フェーズ5: コード生成（ゴール未定）
9. **コード生成** - インタプリタ? JS出力? WASM?

### 発展（興味があれば）
- パターンマッチ
- エラーメッセージ改善
- REPL（対話環境）
- 最適化（定数畳み込み、インライン展開）

## 記事の方針
- Zennに記事を書きながら進める（学習メモも兼ねる）
- コンポーネント単位で1記事にまとめる
  - 例: 字句解析、構文解析、評価器、型推論...など

## 参考資料
- オリジナルMinCaml: https://esumii.github.io/min-caml/

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

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
