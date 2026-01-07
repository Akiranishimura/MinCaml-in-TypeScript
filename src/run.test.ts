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

	describe("比較演算", () => {
		test("小なり比較ができる", () => {
			expect(run("1 < 2")).toBe(true);
		});

		test("大なり比較ができる", () => {
			expect(run("2 > 1")).toBe(true);
		});

		test("以下比較ができる", () => {
			expect(run("1 <= 1")).toBe(true);
		});

		test("以上比較ができる", () => {
			expect(run("1 >= 1")).toBe(true);
		});

		test("等価比較ができる", () => {
			expect(run("1 = 1")).toBe(true);
		});

		test("不等価比較ができる", () => {
			expect(run("1 <> 2")).toBe(true);
		});

		test("式の結果を比較できる", () => {
			expect(run("1 + 2 < 4")).toBe(true);
		});
	});

	describe("条件分岐", () => {
		test("thenブランチを評価できる", () => {
			expect(run("if true then 1 else 2")).toBe(1);
		});

		test("elseブランチを評価できる", () => {
			expect(run("if false then 1 else 2")).toBe(2);
		});

		test("比較演算を条件に使える", () => {
			expect(run("if 1 < 2 then 10 else 20")).toBe(10);
		});

		test("let式と組み合わせられる", () => {
			expect(run("let x = 5 in if x < 10 then x + 1 else x - 1")).toBe(6);
		});
	});

	describe("関数定義と呼び出し", () => {
		test("恒等関数を定義して呼び出せる", () => {
			expect(run("let rec f x = x in f 1")).toBe(1);
		});

		test("引数を使った計算ができる", () => {
			expect(run("let rec double x = x * 2 in double 5")).toBe(10);
		});

		test("複数引数の関数を定義して呼び出せる", () => {
			expect(run("let rec add x y = x + y in add 3 5")).toBe(8);
		});

		test("再帰関数（階乗）を定義して呼び出せる", () => {
			expect(
				run("let rec fact n = if n < 1 then 1 else n * fact (n - 1) in fact 5")
			).toBe(120);
		});

		test("再帰関数（フィボナッチ）を定義して呼び出せる", () => {
			expect(
				run(
					"let rec fib n = if n < 2 then n else fib (n - 1) + fib (n - 2) in fib 10"
				)
			).toBe(55);
		});

		test("高階関数（関数を返す関数）を定義して呼び出せる", () => {
			expect(
				run("let rec makeAdder x = let rec f y = x + y in f in (makeAdder 3) 5")
			).toBe(8);
		});

		test("関数を引数に取る関数を定義して呼び出せる", () => {
			expect(
				run(
					"let rec apply f x = f x in let rec double n = n * 2 in apply double 5"
				)
			).toBe(10);
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

	describe("型エラー", () => {
		test("算術演算にboolを使うとエラー", () => {
			expect(() => run("true + 1")).toThrow("Type mismatch");
		});

		test("算術演算の両辺がboolでエラー", () => {
			expect(() => run("true * false")).toThrow("Type mismatch");
		});

		test("比較演算にboolを使うとエラー", () => {
			expect(() => run("true < false")).toThrow("Type mismatch");
		});

		test("ifの条件がintでエラー", () => {
			expect(() => run("if 1 then 2 else 3")).toThrow("Type mismatch");
		});

		test("ifの分岐の型が異なるとエラー", () => {
			expect(() => run("if true then 1 else false")).toThrow("Type mismatch");
		});

		test("関数でないものを呼び出すとエラー", () => {
			expect(() => run("let x = 1 in x 2")).toThrow("Type mismatch");
		});

		test("関数に渡す引数の型が異なるとエラー", () => {
			expect(() => run("let rec f x = x + 1 in f true")).toThrow(
				"Type mismatch"
			);
		});

		test("関数の引数の数が異なるとエラー", () => {
			expect(() => run("let rec f x y = x + y in f 1")).toThrow(
				"Function type mismatch"
			);
		});

		test("単項マイナスにboolを使うとエラー", () => {
			expect(() => run("-true")).toThrow("Type mismatch");
		});

		test("let式の変数をboolとintで使うとエラー", () => {
			expect(() => run("let x = 1 in if x then 2 else 3")).toThrow(
				"Type mismatch"
			);
		});
	});
});
