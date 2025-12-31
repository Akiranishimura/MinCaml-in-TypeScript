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
	});
});
