import { describe, expect, test } from "bun:test";
import { run } from "./run";

describe("run", () => {
	test("1 + 2 * 3を評価できる", () => {
		const result = run("1 + 2 * 3");
		expect(result).toBe(7);
	});
	test("(1 + 2) * 3を評価できる", () => {
		const result = run("(1 + 2) * 3");
		expect(result).toBe(9);
	});
	test("2 / 0でエラーを投げる", () => {
		expect(() => run("1 + 2 / 0")).toThrow("Division by zero");
	});
	test("負の値を評価できる", () => {
		const result = run("-1");
		expect(result).toBe(-1);
	});
	test("二重否定を評価できる", () => {
		const result = run("--5");
		expect(result).toBe(5);
	});
	test("括弧付きの負の値を評価できる", () => {
		const result = run("-(1 + 2)");
		expect(result).toBe(-3);
	});
	test("負の値を含む式を評価できる", () => {
		const result = run("3 + -2");
		expect(result).toBe(1);
	});

	describe("let式", () => {
		test("let x = 5 in x を評価できる", () => {
			const result = run("let x = 5 in x");
			expect(result).toBe(5);
		});

		test("let x = 5 in x + 1 を評価できる", () => {
			const result = run("let x = 5 in x + 1");
			expect(result).toBe(6);
		});

		test("ネストしたlet式を評価できる", () => {
			const result = run("let x = 1 in let y = 2 in x + y");
			expect(result).toBe(3);
		});

		test("let式のvalueに式を使える", () => {
			const result = run("let x = 1 + 2 in x * 3");
			expect(result).toBe(9);
		});

		test("シャドーイングが正しく動作する", () => {
			const result = run("let x = 1 in let x = 2 in x");
			expect(result).toBe(2);
		});
	});

	describe("異常系", () => {
		test("空の入力でエラー", () => {
			expect(() => run("")).toThrow();
		});

		test("不正な文字でエラー", () => {
			expect(() => run("1 @ 2")).toThrow();
		});

		test("式が不完全でエラー", () => {
			expect(() => run("1 +")).toThrow();
		});

		test("括弧が閉じていないとエラー", () => {
			expect(() => run("(1 + 2")).toThrow();
		});

		test("未定義の変数でエラー", () => {
			expect(() => run("let x = 1 in y")).toThrow("Variable not found: y");
		});
	});
});
