import { describe, expect, test } from "bun:test";
import type { Token } from "../lexer/lexer";
import { parse } from "./parser";

describe("Parser", () => {
	test("数字をパースできる", () => {
		const tokens: Token[] = [{ type: "NUMBER", value: 1 }, { type: "EOF" }];
		const expr = parse(tokens);
		expect(expr).toEqual({ type: "Number", value: 1 });
	});
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
