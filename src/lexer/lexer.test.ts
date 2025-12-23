import { describe, expect, test } from "bun:test";
import { tokenize } from "./lexer";

describe("Lexer", () => {
	test("数字1つをトークン化できる", () => {
		const tokens = tokenize("1");
		expect(tokens).toEqual([{ type: "NUMBER", value: 1 }, { type: "EOF" }]);
	});
	test("複数桁の数字をトークン化できる", () => {
		const tokens = tokenize("123");
		expect(tokens).toEqual([{ type: "NUMBER", value: 123 }, { type: "EOF" }]);
	});
	test("四則演算をトークン化できる", () => {
		const tokens = tokenize("1 + 2 * 3");
		expect(tokens).toEqual([
			{ type: "NUMBER", value: 1 },
			{ type: "PLUS" },
			{ type: "NUMBER", value: 2 },
			{ type: "MULTIPLY" },
			{ type: "NUMBER", value: 3 },
			{ type: "EOF" },
		]);
	});
	test("括弧をトークン化できる", () => {
		const tokens = tokenize("(1 + 2) * 3");
		expect(tokens).toEqual([
			{ type: "LPAREN" },
			{ type: "NUMBER", value: 1 },
			{ type: "PLUS" },
			{ type: "NUMBER", value: 2 },
			{ type: "RPAREN" },
			{ type: "MULTIPLY" },
			{ type: "NUMBER", value: 3 },
			{ type: "EOF" },
		]);
	});

	test("未知の文字でエラーを投げる", () => {
		expect(() => tokenize("1 @ 2")).toThrow();
	});
});
