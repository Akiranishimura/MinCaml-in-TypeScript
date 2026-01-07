import { describe, expect, test } from "bun:test";
import type { Expr } from "../parser/parser";
import { infer, type Type, unify } from "./typecheck";

describe("Typecheck", () => {
	describe("リテラル", () => {
		test("数値リテラルの型は TInt", () => {
			const ast: Expr = { type: "Number", value: 1 };
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("trueの型は TBool", () => {
			const ast: Expr = { type: "Bool", value: true };
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});

		test("falseの型は TBool", () => {
			const ast: Expr = { type: "Bool", value: false };
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});
	});

	describe("演算子", () => {
		test("比較演算 1 < 2 の型は TBool", () => {
			const ast: Expr = {
				type: "BinOp",
				operator: "<",
				left: { type: "Number", value: 1 },
				right: { type: "Number", value: 2 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TBool" });
		});

		test("単項演算 -1 の型は TInt", () => {
			const ast: Expr = {
				type: "UnaryOp",
				operator: "-",
				expr: { type: "Number", value: 1 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("let式", () => {
		test("let x = 1 in x の型は TInt", () => {
			const ast: Expr = {
				type: "LET",
				name: "x",
				value: { type: "Number", value: 1 },
				body: { type: "VAR", name: "x" },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("if式", () => {
		test("if true then 1 else 2 の型は TInt", () => {
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: { type: "Number", value: 1 },
				else_: { type: "Number", value: 2 },
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("関数", () => {
		test("let rec f x = x + 1 in f 1 の型は TInt", () => {
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: ["x"],
					body: {
						type: "BinOp",
						operator: "+",
						left: { type: "VAR", name: "x" },
						right: { type: "Number", value: 1 },
					},
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "Number", value: 1 }],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("let rec fib n = if n < 2 then n else fib (n - 1) + fib (n - 2) in fib 10 の型は TInt", () => {
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "fib",
					args: ["n"],
					body: {
						type: "IF",
						cond: {
							type: "BinOp",
							operator: "<",
							left: { type: "VAR", name: "n" },
							right: { type: "Number", value: 2 },
						},
						then_: { type: "VAR", name: "n" },
						else_: {
							type: "BinOp",
							operator: "+",
							left: {
								type: "App",
								func: { type: "VAR", name: "fib" },
								args: [
									{
										type: "BinOp",
										operator: "-",
										left: { type: "VAR", name: "n" },
										right: { type: "Number", value: 1 },
									},
								],
							},
							right: {
								type: "App",
								func: { type: "VAR", name: "fib" },
								args: [
									{
										type: "BinOp",
										operator: "-",
										left: { type: "VAR", name: "n" },
										right: { type: "Number", value: 2 },
									},
								],
							},
						},
					},
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "fib" },
					args: [{ type: "Number", value: 10 }],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("let rec add x y = x + y in add 1 2 の型は TInt", () => {
			const ast: Expr = {
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
				body: {
					type: "App",
					func: { type: "VAR", name: "add" },
					args: [
						{ type: "Number", value: 1 },
						{ type: "Number", value: 2 },
					],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("恒等関数 let rec id x = x in id 1 の型は TInt", () => {
			// App の func が TVar のケースをカバー
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "id",
					args: ["x"],
					body: { type: "VAR", name: "x" },
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "id" },
					args: [{ type: "Number", value: 1 }],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("高階関数（関数を返す関数）の型推論", () => {
			// let rec makeAdder x = let rec f y = x + y in f in (makeAdder 3) 5
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "makeAdder",
					args: ["x"],
					body: {
						type: "LetRec",
						func: {
							name: "f",
							args: ["y"],
							body: {
								type: "BinOp",
								operator: "+",
								left: { type: "VAR", name: "x" },
								right: { type: "VAR", name: "y" },
							},
						},
						body: { type: "VAR", name: "f" },
					},
				},
				body: {
					type: "App",
					func: {
						type: "App",
						func: { type: "VAR", name: "makeAdder" },
						args: [{ type: "Number", value: 3 }],
					},
					args: [{ type: "Number", value: 5 }],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});

		test("関数を引数に取る関数の型推論", () => {
			// let rec apply f x = f x in let rec double n = n * 2 in apply double 5
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "apply",
					args: ["f", "x"],
					body: {
						type: "App",
						func: { type: "VAR", name: "f" },
						args: [{ type: "VAR", name: "x" }],
					},
				},
				body: {
					type: "LetRec",
					func: {
						name: "double",
						args: ["n"],
						body: {
							type: "BinOp",
							operator: "*",
							left: { type: "VAR", name: "n" },
							right: { type: "Number", value: 2 },
						},
					},
					body: {
						type: "App",
						func: { type: "VAR", name: "apply" },
						args: [
							{ type: "VAR", name: "double" },
							{ type: "Number", value: 5 },
						],
					},
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});

	describe("関数型の解決", () => {
		test("関数を返す式の型が正しく解決される", () => {
			// let rec f x = x + 1 in f
			// → TFun([TInt], TInt) が返るべき
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: ["x"],
					body: {
						type: "BinOp",
						operator: "+",
						left: { type: "VAR", name: "x" },
						right: { type: "Number", value: 1 },
					},
				},
				body: { type: "VAR", name: "f" },
			};
			const result = infer(ast);
			// TFun の内部も解決されているべき
			expect(result.type).toBe("TFun");
			if (result.type === "TFun") {
				expect(result.args[0]).toEqual({ type: "TInt" });
				expect(result.ret).toEqual({ type: "TInt" });
			}
		});

		test("恒等関数を返す式で型変数が未解決の場合エラー", () => {
			// let rec id x = x in id
			// → TFun([α], α) だが、α が未解決なのでエラーになるべき
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "id",
					args: ["x"],
					body: { type: "VAR", name: "x" },
				},
				body: { type: "VAR", name: "id" },
			};
			// 型変数が具体化されていないのでエラーになるはず
			expect(() => infer(ast)).toThrow();
		});

		test("高階関数を返す式の型が正しく解決される", () => {
			// let rec makeAdder x = let rec f y = x + y in f in makeAdder
			// → TFun([TInt], TFun([TInt], TInt))
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "makeAdder",
					args: ["x"],
					body: {
						type: "LetRec",
						func: {
							name: "f",
							args: ["y"],
							body: {
								type: "BinOp",
								operator: "+",
								left: { type: "VAR", name: "x" },
								right: { type: "VAR", name: "y" },
							},
						},
						body: { type: "VAR", name: "f" },
					},
				},
				body: { type: "VAR", name: "makeAdder" },
			};
			const result = infer(ast);
			expect(result.type).toBe("TFun");
			if (result.type === "TFun") {
				expect(result.args[0]).toEqual({ type: "TInt" });
				expect(result.ret.type).toBe("TFun");
				if (result.ret.type === "TFun") {
					expect(result.ret.args[0]).toEqual({ type: "TInt" });
					expect(result.ret.ret).toEqual({ type: "TInt" });
				}
			}
		});
	});

	describe("型エラー", () => {
		test("1 + true は型エラー", () => {
			const ast: Expr = {
				type: "BinOp",
				operator: "+",
				left: { type: "Number", value: 1 },
				right: { type: "Bool", value: true },
			};
			expect(() => infer(ast)).toThrow();
		});

		test("if 1 then 2 else 3 は型エラー（条件が bool でない）", () => {
			const ast: Expr = {
				type: "IF",
				cond: { type: "Number", value: 1 },
				then_: { type: "Number", value: 2 },
				else_: { type: "Number", value: 3 },
			};
			expect(() => infer(ast)).toThrow();
		});

		test("if true then 1 else true は型エラー（then と else の型が違う）", () => {
			const ast: Expr = {
				type: "IF",
				cond: { type: "Bool", value: true },
				then_: { type: "Number", value: 1 },
				else_: { type: "Bool", value: true },
			};
			expect(() => infer(ast)).toThrow();
		});

		test("関数の引数の数が合わない場合は型エラー", () => {
			// let rec f x y = x + y in f 1
			// f: TFun([TInt, TInt], TInt) に対して引数1つで呼び出し
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: ["x", "y"],
					body: {
						type: "BinOp",
						operator: "+",
						left: { type: "VAR", name: "x" },
						right: { type: "VAR", name: "y" },
					},
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "Number", value: 1 }],
				},
			};
			expect(() => infer(ast)).toThrow();
		});

		test("引数なし関数の定義と呼び出し", () => {
			// let rec f = 1 in f ()
			// f: TFun([], TInt) に対して引数を渡して呼び出し → エラー
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: [],
					body: { type: "Number", value: 1 },
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [{ type: "Number", value: 0 }],
				},
			};
			expect(() => infer(ast)).toThrow();
		});

		test("引数なし関数を引数なしで呼び出すと正常", () => {
			// let rec f = 1 in f
			// f: TFun([], TInt)、f を呼び出さずに返すと未解決エラー
			// または f() として呼び出すべき
			const ast: Expr = {
				type: "LetRec",
				func: {
					name: "f",
					args: [],
					body: { type: "Number", value: 1 },
				},
				body: {
					type: "App",
					func: { type: "VAR", name: "f" },
					args: [],
				},
			};
			const result = infer(ast);
			expect(result).toEqual({ type: "TInt" });
		});
	});
});

describe("unify", () => {
	test("同じ型同士は単一化できる", () => {
		const t1: Type = { type: "TInt" };
		const t2: Type = { type: "TInt" };
		expect(() => unify(t1, t2)).not.toThrow();
	});

	test("異なる型同士は単一化できない", () => {
		const t1: Type = { type: "TInt" };
		const t2: Type = { type: "TBool" };
		expect(() => unify(t1, t2)).toThrow();
	});

	test("型変数と具体型を単一化すると、型変数が解決される", () => {
		const tvar: Type = { type: "TVar", id: 0, resolved: {} };
		const tint: Type = { type: "TInt" };
		unify(tvar, tint);
		expect(tvar.resolved.value).toEqual({ type: "TInt" });
	});

	test("TFun 同士の単一化", () => {
		// unify(TFun([α], β), TFun([TInt], TBool))
		// → α = TInt, β = TBool
		const alpha: Type = { type: "TVar", id: 100, resolved: {} };
		const beta: Type = { type: "TVar", id: 101, resolved: {} };
		const t1: Type = { type: "TFun", args: [alpha], ret: beta };
		const t2: Type = {
			type: "TFun",
			args: [{ type: "TInt" }],
			ret: { type: "TBool" },
		};
		unify(t1, t2);
		expect(alpha.resolved.value).toEqual({ type: "TInt" });
		expect(beta.resolved.value).toEqual({ type: "TBool" });
	});

	test("解決済み TVar の処理", () => {
		// α.resolved = TInt のとき、unify(α, TInt) が成功する
		const alpha: Type = {
			type: "TVar",
			id: 200,
			resolved: { value: { type: "TInt" } },
		};
		expect(() => unify(alpha, { type: "TInt" })).not.toThrow();
	});

	test("解決済み TVar と異なる型は単一化できない", () => {
		// α.resolved = TInt のとき、unify(α, TBool) はエラー
		const alpha: Type = {
			type: "TVar",
			id: 201,
			resolved: { value: { type: "TInt" } },
		};
		expect(() => unify(alpha, { type: "TBool" })).toThrow();
	});

	test("t2 が TVar の場合", () => {
		// unify(TInt, α) → α = TInt
		const alpha: Type = { type: "TVar", id: 300, resolved: {} };
		unify({ type: "TInt" }, alpha);
		expect(alpha.resolved.value).toEqual({ type: "TInt" });
	});

	test("TVar 同士の単一化", () => {
		// unify(α, β) → α.resolved = β
		const alpha: Type = { type: "TVar", id: 500, resolved: {} };
		const beta: Type = { type: "TVar", id: 501, resolved: {} };
		expect(() => unify(alpha, beta)).not.toThrow();
		expect(alpha.resolved.value).toBe(beta);
	});

	test("occurs check: 無限型はエラー", () => {
		// unify(α, TFun([α], TInt)) → エラー（無限型）
		const alpha: Type = { type: "TVar", id: 400, resolved: {} };
		const funcType: Type = {
			type: "TFun",
			args: [alpha],
			ret: { type: "TInt" },
		};
		expect(() => unify(alpha, funcType)).toThrow();
	});
});
