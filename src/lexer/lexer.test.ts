import { describe, expect, test } from "bun:test";
import { tokenize } from "./lexer";

describe("Lexer", () => {
	describe("数値", () => {
		test("数字1つをトークン化できる", () => {
			const tokens = tokenize("1");
			expect(tokens).toEqual([{ type: "NUMBER", value: 1 }, { type: "EOF" }]);
		});

		test("複数桁の数字をトークン化できる", () => {
			const tokens = tokenize("123");
			expect(tokens).toEqual([{ type: "NUMBER", value: 123 }, { type: "EOF" }]);
		});
	});

	describe("演算子", () => {
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

		test("等号をトークン化できる", () => {
			const tokens = tokenize("=");
			expect(tokens).toEqual([{ type: "EQ" }, { type: "EOF" }]);
		});

		test("<をトークン化できる", () => {
			const tokens = tokenize("<");
			expect(tokens).toEqual([{ type: "LT" }, { type: "EOF" }]);
		});

		test(">をトークン化できる", () => {
			const tokens = tokenize(">");
			expect(tokens).toEqual([{ type: "GT" }, { type: "EOF" }]);
		});

		test("<=をトークン化できる", () => {
			const tokens = tokenize("<=");
			expect(tokens).toEqual([{ type: "LE" }, { type: "EOF" }]);
		});

		test(">=をトークン化できる", () => {
			const tokens = tokenize(">=");
			expect(tokens).toEqual([{ type: "GE" }, { type: "EOF" }]);
		});

		test("<>をトークン化できる", () => {
			const tokens = tokenize("<>");
			expect(tokens).toEqual([{ type: "NEQ" }, { type: "EOF" }]);
		});
	});

	describe("括弧", () => {
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
	});

	describe("キーワード", () => {
		test("letをトークン化できる", () => {
			const tokens = tokenize("let");
			expect(tokens).toEqual([{ type: "LET" }, { type: "EOF" }]);
		});

		test("inをトークン化できる", () => {
			const tokens = tokenize("in");
			expect(tokens).toEqual([{ type: "IN" }, { type: "EOF" }]);
		});

		test("ifをトークン化できる", () => {
			const tokens = tokenize("if");
			expect(tokens).toEqual([{ type: "IF" }, { type: "EOF" }]);
		});

		test("thenをトークン化できる", () => {
			const tokens = tokenize("then");
			expect(tokens).toEqual([{ type: "THEN" }, { type: "EOF" }]);
		});

		test("elseをトークン化できる", () => {
			const tokens = tokenize("else");
			expect(tokens).toEqual([{ type: "ELSE" }, { type: "EOF" }]);
		});

		test("trueをトークン化できる", () => {
			const tokens = tokenize("true");
			expect(tokens).toEqual([{ type: "TRUE" }, { type: "EOF" }]);
		});

		test("falseをトークン化できる", () => {
			const tokens = tokenize("false");
			expect(tokens).toEqual([{ type: "FALSE" }, { type: "EOF" }]);
		});

		test("recをトークン化できる", () => {
			const tokens = tokenize("rec");
			expect(tokens).toEqual([{ type: "REC" }, { type: "EOF" }]);
		});

		test("recを含む識別子はキーワードではない", () => {
			const tokens = tokenize("record");
			expect(tokens).toEqual([
				{ type: "IDENT", value: "record" },
				{ type: "EOF" },
			]);
		});
	});

	describe("識別子", () => {
		test("変数をトークン化できる", () => {
			const tokens = tokenize("x");
			expect(tokens).toEqual([{ type: "IDENT", value: "x" }, { type: "EOF" }]);
		});

		test("数字を含む変数をトークン化できる", () => {
			const tokens = tokenize("x1");
			expect(tokens).toEqual([{ type: "IDENT", value: "x1" }, { type: "EOF" }]);
		});
	});

	describe("式", () => {
		test("変数宣言をトークン化できる", () => {
			const tokens = tokenize("let x = 1");
			expect(tokens).toEqual([
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			]);
		});

		test("if式をトークン化できる", () => {
			const tokens = tokenize("if true then 1 else 0");
			expect(tokens).toEqual([
				{ type: "IF" },
				{ type: "TRUE" },
				{ type: "THEN" },
				{ type: "NUMBER", value: 1 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 0 },
				{ type: "EOF" },
			]);
		});

		test("関数定義をトークン化できる", () => {
			const tokens = tokenize("let rec f x = x + 1 in f 5");
			expect(tokens).toEqual([
				{ type: "LET" },
				{ type: "REC" },
				{ type: "IDENT", value: "f" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "IDENT", value: "x" },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "IN" },
				{ type: "IDENT", value: "f" },
				{ type: "NUMBER", value: 5 },
				{ type: "EOF" },
			]);
		});

		test("複数引数の関数定義をトークン化できる", () => {
			const tokens = tokenize("let rec add x y = x + y in add 1 2");
			expect(tokens).toEqual([
				{ type: "LET" },
				{ type: "REC" },
				{ type: "IDENT", value: "add" },
				{ type: "IDENT", value: "x" },
				{ type: "IDENT", value: "y" },
				{ type: "EQ" },
				{ type: "IDENT", value: "x" },
				{ type: "PLUS" },
				{ type: "IDENT", value: "y" },
				{ type: "IN" },
				{ type: "IDENT", value: "add" },
				{ type: "NUMBER", value: 1 },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			]);
		});
	});

	describe("エラー", () => {
		test("未知の文字でエラーを投げる", () => {
			expect(() => tokenize("1 @ 2")).toThrow();
		});
	});
});
