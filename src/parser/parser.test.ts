import { describe, expect, test } from "bun:test";
import type { Token } from "../lexer/lexer";
import { parse } from "./parser";

describe("Parser", () => {
	describe("リテラル", () => {
		test("数字をパースできる", () => {
			const tokens: Token[] = [{ type: "NUMBER", value: 1 }, { type: "EOF" }];
			const expr = parse(tokens);
			expect(expr).toEqual({ type: "Number", value: 1 });
		});
	});

	describe("演算子", () => {
		test("加算をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
				operator: "+",
			});
		});

		test("1 + 2 * 3で乗算が優先される", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "MULTIPLY" },
				{ type: "NUMBER", value: 3 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "+",
				left: { type: "Number", value: 1 },
				right: {
					type: "BinOp",
					operator: "*",
					left: { type: "Number", value: 2 },
					right: { type: "Number", value: 3 },
				},
			});
		});

		test("2 * 3 + 1 で乗算が優先される", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 2 },
				{ type: "MULTIPLY" },
				{ type: "NUMBER", value: 3 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "+",
				left: {
					type: "BinOp",
					operator: "*",
					left: { type: "Number", value: 2 },
					right: { type: "Number", value: 3 },
				},
				right: { type: "Number", value: 1 },
			});
		});

		test("負の値をパースできる", () => {
			const tokens: Token[] = [
				{ type: "MINUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "UnaryOp",
				operator: "-",
				expr: { type: "Number", value: 1 },
			});
		});
	});

	describe("括弧", () => {
		test("(1 + 2) * 3 で括弧が優先される", () => {
			const tokens: Token[] = [
				{ type: "LPAREN" },
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "RPAREN" },
				{ type: "MULTIPLY" },
				{ type: "NUMBER", value: 3 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "*",
				left: {
					type: "BinOp",
					operator: "+",
					left: { type: "Number", value: 1 },
					right: { type: "Number", value: 2 },
				},
				right: { type: "Number", value: 3 },
			});
		});
	});

	describe("変数", () => {
		test("変数をパースできる", () => {
			const tokens: Token[] = [{ type: "IDENT", value: "x" }, { type: "EOF" }];
			const expr = parse(tokens);
			expect(expr).toEqual({ type: "VAR", name: "x" });
		});
	});

	describe("let式", () => {
		test("変数宣言をパースできる", () => {
			// let x = 1 in x
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: { type: "VAR", name: "x" },
			});
		});

		test("bodyに式があるlet式をパースできる", () => {
			// let x = 1 in x + 1
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: {
					type: "BinOp",
					left: { type: "VAR", name: "x" },
					right: { type: "Number", value: 1 },
					operator: "+",
				},
			});
		});

		test("valueに式があるlet式をパースできる", () => {
			// let x = 1 + 2 in x
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LET",
				name: "x",
				value: {
					type: "BinOp",
					left: { type: "Number", value: 1 },
					right: { type: "Number", value: 2 },
					operator: "+",
				},
				body: { type: "VAR", name: "x" },
			});
		});

		test("ネストしたlet式をパースできる", () => {
			// let x = 1 in let y = 2 in x + y
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "IN" },
				{ type: "LET" },
				{ type: "IDENT", value: "y" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 2 },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "PLUS" },
				{ type: "IDENT", value: "y" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
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
			});
		});
	});
});
