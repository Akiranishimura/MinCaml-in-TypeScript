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

		test("trueをパースできる", () => {
			const tokens: Token[] = [{ type: "TRUE" }, { type: "EOF" }];
			const expr = parse(tokens);
			expect(expr).toEqual({ type: "Bool", value: true });
		});

		test("falseをパースできる", () => {
			const tokens: Token[] = [{ type: "FALSE" }, { type: "EOF" }];
			const expr = parse(tokens);
			expect(expr).toEqual({ type: "Bool", value: false });
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

		test("比較演算(<)をパースできる", () => {
			// 1 < 2
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "LT" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "<",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("比較演算(>)をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "GT" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: ">",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("比較演算(<=)をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "LE" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "<=",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("比較演算(>=)をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "GE" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: ">=",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("比較演算(=)をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "EQ" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "=",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("比較演算(<>)をパースできる", () => {
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "NEQ" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "<>",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			});
		});

		test("1 + 2 < 3 + 4 で加算が比較より優先される", () => {
			// 1 + 2 < 3 + 4 → (1 + 2) < (3 + 4)
			const tokens: Token[] = [
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "LT" },
				{ type: "NUMBER", value: 3 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 4 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "<",
				left: {
					type: "BinOp",
					operator: "+",
					left: { type: "Number", value: 1 },
					right: { type: "Number", value: 2 },
				},
				right: {
					type: "BinOp",
					operator: "+",
					left: { type: "Number", value: 3 },
					right: { type: "Number", value: 4 },
				},
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

	describe("if式", () => {
		test("if式をパースできる", () => {
			// if true then 1 else 0
			const tokens: Token[] = [
				{ type: "IF" },
				{ type: "TRUE" },
				{ type: "THEN" },
				{ type: "NUMBER", value: 1 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 0 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 0 },
			});
		});

		test("条件に比較演算を含むif式をパースできる", () => {
			// if x < 10 then 1 else 0
			const tokens: Token[] = [
				{ type: "IF" },
				{ type: "IDENT", value: "x" },
				{ type: "LT" },
				{ type: "NUMBER", value: 10 },
				{ type: "THEN" },
				{ type: "NUMBER", value: 1 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 0 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "IF",
				cond: {
					type: "BinOp",
					operator: "<",
					left: { type: "VAR", name: "x" },
					right: { type: "Number", value: 10 },
				},
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 0 },
			});
		});

		test("ネストしたif式をパースできる", () => {
			// if true then if false then 1 else 2 else 3
			const tokens: Token[] = [
				{ type: "IF" },
				{ type: "TRUE" },
				{ type: "THEN" },
				{ type: "IF" },
				{ type: "FALSE" },
				{ type: "THEN" },
				{ type: "NUMBER", value: 1 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 2 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 3 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: {
					type: "IF",
					cond: { type: "Bool", value: false },
					then_: { type: "Number", value: 1 },
					else_: { type: "Number", value: 2 },
				},
				else_: { type: "Number", value: 3 },
			});
		});
	});

	describe("エラー", () => {
		test("空のトークン配列でエラー", () => {
			expect(() => parse([])).toThrow("Unexpected end of input");
		});

		test("let式で=がないとエラー", () => {
			// let x 1 in x (= がない)
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "NUMBER", value: 1 },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			expect(() => parse(tokens)).toThrow();
		});

		test("let式でinがないとエラー", () => {
			// let x = 1 x (in がない)
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "NUMBER", value: 1 },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			expect(() => parse(tokens)).toThrow();
		});

		test("if式でthenがないとエラー", () => {
			// if true 1 else 2 (then がない)
			const tokens: Token[] = [
				{ type: "IF" },
				{ type: "TRUE" },
				{ type: "NUMBER", value: 1 },
				{ type: "ELSE" },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			expect(() => parse(tokens)).toThrow();
		});

		test("if式でelseがないとエラー", () => {
			// if true then 1 2 (else がない)
			const tokens: Token[] = [
				{ type: "IF" },
				{ type: "TRUE" },
				{ type: "THEN" },
				{ type: "NUMBER", value: 1 },
				{ type: "NUMBER", value: 2 },
				{ type: "EOF" },
			];
			expect(() => parse(tokens)).toThrow();
		});
	});

	describe("関数適用", () => {
		test("関数適用をパースできる", () => {
			// f 1
			const tokens: Token[] = [
				{ type: "IDENT", value: "f" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "App",
				func: { type: "VAR", name: "f" },
				args: [{ type: "Number", value: 1 }],
			});
		});

		test("括弧付き引数の関数適用をパースできる", () => {
			// f (n - 1)
			const tokens: Token[] = [
				{ type: "IDENT", value: "f" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "n" },
				{ type: "MINUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "RPAREN" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "App",
				func: { type: "VAR", name: "f" },
				args: [
					{
						type: "BinOp",
						operator: "-",
						left: { type: "VAR", name: "n" },
						right: { type: "Number", value: 1 },
					},
				],
			});
		});

		test("乗算の右辺に関数適用をパースできる", () => {
			// n * f (n - 1)  => n * (f (n - 1))
			const tokens: Token[] = [
				{ type: "IDENT", value: "n" },
				{ type: "MULTIPLY" },
				{ type: "IDENT", value: "f" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "n" },
				{ type: "MINUS" },
				{ type: "NUMBER", value: 1 },
				{ type: "RPAREN" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "*",
				left: { type: "VAR", name: "n" },
				right: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [
						{
							type: "BinOp",
							operator: "-",
							left: { type: "VAR", name: "n" },
							right: { type: "Number", value: 1 },
						},
					],
				},
			});
		});

		test("加算の右辺に関数適用をパースできる", () => {
			// a + f b => a + (f b)
			const tokens: Token[] = [
				{ type: "IDENT", value: "a" },
				{ type: "PLUS" },
				{ type: "IDENT", value: "f" },
				{ type: "IDENT", value: "b" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "BinOp",
				operator: "+",
				left: { type: "VAR", name: "a" },
				right: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "VAR", name: "b" }],
				},
			});
		});
	});

	describe("関数定義", () => {
		test("最小の関数定義をパースできる", () => {
			// let rec f x = x in 1
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "REC" },
				{ type: "IDENT", value: "f" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "IDENT", value: "x" },
				{ type: "IN" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetRec",
				func: {
					name: "f",
					args: ["x"],
					body: { type: "VAR", name: "x" },
				},
				body: { type: "Number", value: 1 },
			});
		});

		test("複数引数の関数定義をパースできる", () => {
			// let rec add x y = x + y in 1
			const tokens: Token[] = [
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
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetRec",
				func: {
					name: "add",
					args: ["x", "y"],
					body: {
						type: "BinOp",
						operator: "+",
						left: { type: "VAR", name: "x" },
						right: { type: "VAR", name: "y" },
					},
				},
				body: { type: "Number", value: 1 },
			});
		});

		test("関数定義と関数適用を組み合わせられる", () => {
			// let rec f x = x in f 1
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "REC" },
				{ type: "IDENT", value: "f" },
				{ type: "IDENT", value: "x" },
				{ type: "EQ" },
				{ type: "IDENT", value: "x" },
				{ type: "IN" },
				{ type: "IDENT", value: "f" },
				{ type: "NUMBER", value: 1 },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetRec",
				func: {
					name: "f",
					args: ["x"],
					body: { type: "VAR", name: "x" },
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "Number", value: 1 }],
				},
			});
		});
	});

	describe("タプル", () => {
		test("タプル作成をパースできる", () => {
			// (1, 2)
			const tokens: Token[] = [
				{ type: "LPAREN" },
				{ type: "NUMBER", value: 1 },
				{ type: "COMMA" },
				{ type: "NUMBER", value: 2 },
				{ type: "RPAREN" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "Tuple",
				elements: [
					{ type: "Number", value: 1 },
					{ type: "Number", value: 2 },
				],
			});
		});

		test("タプル分解をパースできる", () => {
			// let (x, y) = t in x
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "x" },
				{ type: "COMMA" },
				{ type: "IDENT", value: "y" },
				{ type: "RPAREN" },
				{ type: "EQ" },
				{ type: "IDENT", value: "t" },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetTuple",
				names: ["x", "y"],
				value: { type: "VAR", name: "t" },
				body: { type: "VAR", name: "x" },
			});
		});

		test("3要素タプルをパースできる", () => {
			// (1, 2, 3)
			const tokens: Token[] = [
				{ type: "LPAREN" },
				{ type: "NUMBER", value: 1 },
				{ type: "COMMA" },
				{ type: "NUMBER", value: 2 },
				{ type: "COMMA" },
				{ type: "NUMBER", value: 3 },
				{ type: "RPAREN" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "Tuple",
				elements: [
					{ type: "Number", value: 1 },
					{ type: "Number", value: 2 },
					{ type: "Number", value: 3 },
				],
			});
		});

		test("式を含むタプルをパースできる", () => {
			// (1 + 2, 3 < 4)
			const tokens: Token[] = [
				{ type: "LPAREN" },
				{ type: "NUMBER", value: 1 },
				{ type: "PLUS" },
				{ type: "NUMBER", value: 2 },
				{ type: "COMMA" },
				{ type: "NUMBER", value: 3 },
				{ type: "LT" },
				{ type: "NUMBER", value: 4 },
				{ type: "RPAREN" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "Tuple",
				elements: [
					{
						type: "BinOp",
						operator: "+",
						left: { type: "Number", value: 1 },
						right: { type: "Number", value: 2 },
					},
					{
						type: "BinOp",
						operator: "<",
						left: { type: "Number", value: 3 },
						right: { type: "Number", value: 4 },
					},
				],
			});
		});

		test("3要素のタプル分解をパースできる", () => {
			// let (x, y, z) = t in x
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "x" },
				{ type: "COMMA" },
				{ type: "IDENT", value: "y" },
				{ type: "COMMA" },
				{ type: "IDENT", value: "z" },
				{ type: "RPAREN" },
				{ type: "EQ" },
				{ type: "IDENT", value: "t" },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetTuple",
				names: ["x", "y", "z"],
				value: { type: "VAR", name: "t" },
				body: { type: "VAR", name: "x" },
			});
		});

		test("タプル分解のbodyに式を含む", () => {
			// let (x, y) = t in x + y
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "x" },
				{ type: "COMMA" },
				{ type: "IDENT", value: "y" },
				{ type: "RPAREN" },
				{ type: "EQ" },
				{ type: "IDENT", value: "t" },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "PLUS" },
				{ type: "IDENT", value: "y" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetTuple",
				names: ["x", "y"],
				value: { type: "VAR", name: "t" },
				body: {
					type: "BinOp",
					operator: "+",
					left: { type: "VAR", name: "x" },
					right: { type: "VAR", name: "y" },
				},
			});
		});

		test("タプルリテラルを直接分解できる", () => {
			// let (x, y) = (1, 2) in x
			const tokens: Token[] = [
				{ type: "LET" },
				{ type: "LPAREN" },
				{ type: "IDENT", value: "x" },
				{ type: "COMMA" },
				{ type: "IDENT", value: "y" },
				{ type: "RPAREN" },
				{ type: "EQ" },
				{ type: "LPAREN" },
				{ type: "NUMBER", value: 1 },
				{ type: "COMMA" },
				{ type: "NUMBER", value: 2 },
				{ type: "RPAREN" },
				{ type: "IN" },
				{ type: "IDENT", value: "x" },
				{ type: "EOF" },
			];
			const expr = parse(tokens);
			expect(expr).toEqual({
				type: "LetTuple",
				names: ["x", "y"],
				value: {
					type: "Tuple",
					elements: [
						{ type: "Number", value: 1 },
						{ type: "Number", value: 2 },
					],
				},
				body: { type: "VAR", name: "x" },
			});
		});
	});
});
