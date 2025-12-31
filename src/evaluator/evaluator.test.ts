import { describe, expect, test } from "bun:test";
import type { Expr } from "../parser/parser";
import { evaluate } from "./evaluator";

describe("Evaluator", () => {
	test("数値リテラルを評価できる", () => {
		const ast: Expr = { type: "Number", value: 42 };
		const result = evaluate(ast);
		expect(result).toBe(42);
	});
	test("加算を評価できる", () => {
		const ast: Expr = {
			type: "BinOp",
			left: { type: "Number", value: 1 },
			right: { type: "Number", value: 2 },
			operator: "+",
		};
		const result = evaluate(ast);
		expect(result).toBe(3);
	});
	test("減算を評価できる", () => {
		const ast: Expr = {
			type: "BinOp",
			left: { type: "Number", value: 1 },
			right: { type: "Number", value: 2 },
			operator: "-",
		};
		const result = evaluate(ast);
		expect(result).toBe(-1);
	});
	test("乗算を評価できる", () => {
		const ast: Expr = {
			type: "BinOp",
			left: { type: "Number", value: 3 },
			right: { type: "Number", value: 4 },
			operator: "*",
		};
		const result = evaluate(ast);
		expect(result).toBe(12);
	});
	test("除算を評価できる", () => {
		const ast: Expr = {
			type: "BinOp",
			left: { type: "Number", value: 12 },
			right: { type: "Number", value: 4 },
			operator: "/",
		};
		const result = evaluate(ast);
		expect(result).toBe(3);
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
		const result = evaluate(ast);
		expect(result).toBe(7);
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
		const result = evaluate(ast);
		expect(result).toBe(1 + 2 / 3);
	});
	test("括弧を含む式を評価できる", () => {
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
		const result = evaluate(ast);
		expect(result).toBe(7);
	});
	test("複雑な式を評価できる", () => {
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
		const result = evaluate(ast);
		expect(result).toBe(7);
	});
	test("ゼロ除算でエラーを投げる", () => {
		const ast: Expr = {
			type: "BinOp",
			left: { type: "Number", value: 1 },
			right: { type: "Number", value: 0 },
			operator: "/",
		};
		expect(() => evaluate(ast)).toThrow("Division by zero");
	});
	test("負の値を評価できる", () => {
		const ast: Expr = {
			type: "UnaryOp",
			operator: "-",
			expr: { type: "Number", value: 1 },
		};
		const result = evaluate(ast);
		expect(result).toBe(-1);
	});

	test("let式を評価できる", () => {
		// let x = 5 in x
		const ast: Expr = {
			type: "LET",
			name: "x",
			value: { type: "Number", value: 5 },
			body: { type: "VAR", name: "x" },
		};
		const result = evaluate(ast);
		expect(result).toBe(5);
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
		const result = evaluate(ast);
		expect(result).toBe(6);
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
		const result = evaluate(ast);
		expect(result).toBe(3);
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
		const result = evaluate(ast);
		expect(result).toBe(2);
	});

	test("未定義の変数参照でエラーを投げる", () => {
		const ast: Expr = { type: "VAR", name: "undefined_var" };
		expect(() => evaluate(ast)).toThrow("Variable not found: undefined_var");
	});
});
