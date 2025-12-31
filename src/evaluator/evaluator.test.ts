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
});
