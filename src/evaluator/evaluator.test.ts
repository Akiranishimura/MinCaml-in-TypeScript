import { describe, expect, test } from "bun:test";
import type { Expr } from "../parser/parser";
import { evaluate } from "./evaluator";

describe("Evaluator", () => {
	describe("リテラル", () => {
		test("数値リテラルを評価できる", () => {
			const ast: Expr = { type: "Number", value: 42 };
			expect(evaluate(ast)).toBe(42);
		});

		test("trueを評価できる", () => {
			const ast: Expr = { type: "Bool", value: true };
			expect(evaluate(ast)).toBe(true);
		});

		test("falseを評価できる", () => {
			const ast: Expr = { type: "Bool", value: false };
			expect(evaluate(ast)).toBe(false);
		});

		test("負の値を評価できる", () => {
			const ast: Expr = {
				type: "UnaryOp",
				operator: "-",
				expr: { type: "Number", value: 1 },
			};
			expect(evaluate(ast)).toBe(-1);
		});
	});

	describe("四則演算", () => {
		test("加算を評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
				operator: "+",
			};
			expect(evaluate(ast)).toBe(3);
		});

		test("減算を評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
				operator: "-",
			};
			expect(evaluate(ast)).toBe(-1);
		});

		test("乗算を評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 3 },
				right: { type: "Number", value: 4 },
				operator: "*",
			};
			expect(evaluate(ast)).toBe(12);
		});

		test("除算を評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 12 },
				right: { type: "Number", value: 4 },
				operator: "/",
			};
			expect(evaluate(ast)).toBe(3);
		});

		test("加算と乗算を組み合わせて評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: {
					type: "BinOp",
					left: { type: "Number", value: 2 },
					right: { type: "Number", value: 3 },
					operator: "*",
				},
				operator: "+",
			};
			expect(evaluate(ast)).toBe(7);
		});

		test("加算と除算を組み合わせて評価できる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: {
					type: "BinOp",
					left: { type: "Number", value: 2 },
					right: { type: "Number", value: 3 },
					operator: "/",
				},
				operator: "+",
			};
			expect(evaluate(ast)).toBe(1 + 2 / 3);
		});
	});

	describe("比較演算", () => {
		test("小なり比較でtrueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
				operator: "<",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("小なり比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 2 },
				right: { type: "Number", value: 1 },
				operator: "<",
			};
			expect(evaluate(ast)).toBe(false);
		});

		test("大なり比較でtrueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 3 },
				right: { type: "Number", value: 2 },
				operator: ">",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("大なり比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
				operator: ">",
			};
			expect(evaluate(ast)).toBe(false);
		});

		test("以下比較で等しい場合trueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 2 },
				right: { type: "Number", value: 2 },
				operator: "<=",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("以下比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 3 },
				right: { type: "Number", value: 2 },
				operator: "<=",
			};
			expect(evaluate(ast)).toBe(false);
		});

		test("以上比較でtrueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 3 },
				right: { type: "Number", value: 2 },
				operator: ">=",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("以上比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 2 },
				right: { type: "Number", value: 3 },
				operator: ">=",
			};
			expect(evaluate(ast)).toBe(false);
		});

		test("等価比較でtrueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 5 },
				right: { type: "Number", value: 5 },
				operator: "=",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("等価比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 5 },
				right: { type: "Number", value: 3 },
				operator: "=",
			};
			expect(evaluate(ast)).toBe(false);
		});

		test("不等価比較でtrueを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 5 },
				right: { type: "Number", value: 3 },
				operator: "<>",
			};
			expect(evaluate(ast)).toBe(true);
		});

		test("不等価比較でfalseを返す", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 5 },
				right: { type: "Number", value: 5 },
				operator: "<>",
			};
			expect(evaluate(ast)).toBe(false);
		});
	});

	describe("変数", () => {
		test("変数を参照できる", () => {
			const ast: Expr = { type: "VAR", name: "x" };
			const env = new Map([["x", 42]]);
			expect(evaluate(ast, env)).toBe(42);
		});
	});

	describe("let式", () => {
		test("let式を評価できる", () => {
			// let x = 5 in x
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 5 },
				body: { type: "VAR", name: "x" },
			};
			expect(evaluate(ast)).toBe(5);
		});

		test("let式で変数を使った計算ができる", () => {
			// let x = 5 in x + 1
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 5 },
				body: {
					type: "BinOp",
					left: { type: "VAR", name: "x" },
					right: { type: "Number", value: 1 },
					operator: "+",
				},
			};
			expect(evaluate(ast)).toBe(6);
		});

		test("ネストしたlet式を評価できる", () => {
			// let x = 1 in let y = 2 in x + y
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: {
					type: "LET",
					name: "y",
					value: { type: "Number", value: 2 },
					body: {
						type: "BinOp",
						left: { type: "VAR", name: "x" },
						right: { type: "VAR", name: "y" },
						operator: "+",
					},
				},
			};
			expect(evaluate(ast)).toBe(3);
		});

		test("シャドーイングが正しく動作する", () => {
			// let x = 1 in let x = 2 in x
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: {
					type: "LET",
					name: "x",
					value: { type: "Number", value: 2 },
					body: { type: "VAR", name: "x" },
				},
			};
			expect(evaluate(ast)).toBe(2);
		});
	});

	describe("if式", () => {
		test("thenブランチを評価できる", () => {
			// if true then 1 else 2 => 1
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 2 },
			};
			expect(evaluate(ast)).toBe(1);
		});

		test("elseブランチを評価できる", () => {
			// if false then 1 else 2 => 2
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: false },
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 2 },
			};
			expect(evaluate(ast)).toBe(2);
		});

		test("比較演算を条件に使える", () => {
			// if 1 < 2 then 10 else 20 => 10
			const ast: Expr = {
				type: "IF",
				cond: {
					type: "BinOp",
					left: { type: "Number", value: 1 },
					right: { type: "Number", value: 2 },
					operator: "<",
				},
				then_: { type: "Number", value: 10 },
				else_: { type: "Number", value: 20 },
			};
			expect(evaluate(ast)).toBe(10);
		});

		test("let式と組み合わせて評価できる", () => {
			// let x = 5 in if x > 3 then x * 2 else x => 10
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 5 },
				body: {
					type: "IF",
					cond: {
						type: "BinOp",
						left: { type: "VAR", name: "x" },
						right: { type: "Number", value: 3 },
						operator: ">",
					},
					then_: {
						type: "BinOp",
						left: { type: "VAR", name: "x" },
						right: { type: "Number", value: 2 },
						operator: "*",
					},
					else_: { type: "VAR", name: "x" },
				},
			};
			expect(evaluate(ast)).toBe(10);
		});

		test("ネストしたif式を評価できる", () => {
			// if true then (if false then 1 else 2) else 3 => 2
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: {
					type: "IF",
					cond: { type: "Bool", value: false },
					then_: { type: "Number", value: 1 },
					else_: { type: "Number", value: 2 },
				},
				else_: { type: "Number", value: 3 },
			};
			expect(evaluate(ast)).toBe(2);
		});

		test("if式の結果を計算に使える", () => {
			// (if true then 5 else 10) + 1 => 6
			const ast: Expr = {
				type: "BinOp",
				left: {
					type: "IF",
					cond: { type: "Bool", value: true },
					then_: { type: "Number", value: 5 },
					else_: { type: "Number", value: 10 },
				},
				right: { type: "Number", value: 1 },
				operator: "+",
			};
			expect(evaluate(ast)).toBe(6);
		});

		test("then/else節で式を評価できる", () => {
			// if true then 2 + 3 else 4 * 5 => 5
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: {
					type: "BinOp",
					left: { type: "Number", value: 2 },
					right: { type: "Number", value: 3 },
					operator: "+",
				},
				else_: {
					type: "BinOp",
					left: { type: "Number", value: 4 },
					right: { type: "Number", value: 5 },
					operator: "*",
				},
			};
			expect(evaluate(ast)).toBe(5);
		});
	});

	describe("エラー", () => {
		test("ゼロ除算でエラーを投げる", () => {
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 0 },
				operator: "/",
			};
			expect(() => evaluate(ast)).toThrow("Division by zero");
		});

		test("未定義の変数参照でエラーを投げる", () => {
			const ast: Expr = { type: "VAR", name: "undefined_var" };
			expect(() => evaluate(ast)).toThrow("Variable not found: undefined_var");
		});

		test("数値を期待する場所でbooleanを使うとエラー", () => {
			// true + 1
			const ast: Expr = {
				type: "BinOp",
				left: { type: "Bool", value: true },
				right: { type: "Number", value: 1 },
				operator: "+",
			};
			expect(() => evaluate(ast)).toThrow("Expected number, got boolean");
		});

		test("booleanを期待する場所で数値を使うとエラー", () => {
			// if 1 then 2 else 3
			const ast: Expr = {
				type: "IF",
				cond: { type: "Number", value: 1 },
				then_: { type: "Number", value: 2 },
				else_: { type: "Number", value: 3 },
			};
			expect(() => evaluate(ast)).toThrow("Expected boolean, got number");
		});
	});
});
