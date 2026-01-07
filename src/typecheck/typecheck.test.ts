import { describe, expect, test } from "bun:test";
import type { Expr } from "../parser/parser";
import { infer, type Type, unify } from "./typecheck";

describe("Typecheck", () => {
	describe("リテラル", () => {
		test("数値リテラルの型は TInt", () => {
			const ast: Expr = { type: "Number", value: 1 };
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("trueの型は TBool", () => {
			const ast: Expr = { type: "Bool", value: true };
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});

		test("falseの型は TBool", () => {
			const ast: Expr = { type: "Bool", value: false };
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});
	});

	describe("演算子", () => {
		test("比較演算 1 < 2 の型は TBool", () => {
			const ast: Expr = {
				type: "BinOp",
				operator: "<",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});

		test("単項演算 -1 の型は TInt", () => {
			const ast: Expr = {
				type: "UnaryOp",
				operator: "-",
				expr: { type: "Number", value: 1 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("let式", () => {
		test("let x = 1 in x の型は TInt", () => {
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: { type: "VAR", name: "x" },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("if式", () => {
		test("if true then 1 else 2 の型は TInt", () => {
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 2 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("関数", () => {
		test("let rec f x = x + 1 in f 1 の型は TInt", () => {
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: ["x"],
					body: {
						type: "BinOp",
						operator: "+",
						left: { type: "VAR", name: "x" },
						right: { type: "Number", value: 1 },
					},
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "Number", value: 1 }],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		// TODO: 再帰関数のテスト
		// let rec fib n = if n < 2 then n else fib (n - 1) + fib (n - 2) in fib 10

		// TODO: 複数引数の関数
		// let rec add x y = x + y in add 1 2
	});

	describe("型エラー", () => {
		// TODO: 1 + true は型エラー
		// TODO: if 1 then 2 else 3 は型エラー（条件が bool でない）
		// TODO: if true then 1 else true は型エラー（then と else の型が違う）
	});
});

describe("unify", () => {
	test("同じ型同士は単一化できる", () => {
		const t1: Type = { type: "TInt" };
		const t2: Type = { type: "TInt" };
		expect(() => unify(t1, t2)).not.toThrow();
	});

	test("異なる型同士は単一化できない", () => {
		const t1: Type = { type: "TInt" };
		const t2: Type = { type: "TBool" };
		expect(() => unify(t1, t2)).toThrow();
	});

	test("型変数と具体型を単一化すると、型変数が解決される", () => {
		const tvar: Type = { type: "TVar", id: 0, resolved: {} };
		const tint: Type = { type: "TInt" };
		unify(tvar, tint);
		expect(tvar.resolved.value).toEqual({ type: "TInt" });
	});

	// TODO: TFun 同士の単一化
	// unify(TFun([α], β), TFun([TInt], TBool))
	// → α = TInt, β = TBool

	// TODO: 解決済み TVar の処理
	// α.resolved = TInt のとき、unify(α, TInt) が成功する

	// TODO: t2 が TVar の場合
	// unify(TInt, α) → α = TInt

	// TODO: occurs check
	// unify(α, TFun([α], TInt)) → エラー（無限型）
});
