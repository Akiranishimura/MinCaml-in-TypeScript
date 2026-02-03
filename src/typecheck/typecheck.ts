import type { Expr } from "../parser/parser";

export type Type =
	| { type: "TInt" }
	| { type: "TBool" }
	| { type: "TVar"; id: number; resolved: { value?: Type } }
	| { type: "TFun"; args: Type[]; ret: Type }
	| { type: "TTuple"; elements: Type[] }
	| { type: "TArray"; elementType: Type }
	| { type: "TUnit" };

type TypeContext = {
	typeEnv: Map<string, Type>;
	newVar: () => Type;
};

const createContext = (): TypeContext => {
	let nextVarId = 0;
	return {
		typeEnv: new Map(),
		newVar: () => ({ type: "TVar", id: nextVarId++, resolved: {} }),
	};
};

const occursIn = (tvar: Type & { type: "TVar" }, t: Type): boolean => {
	if (t.type === "TVar") {
		if (t.id === tvar.id) {
			return true;
		}
		if (t.resolved.value !== undefined) {
			return occursIn(tvar, t.resolved.value!);
		}
		return false;
	}
	if (t.type === "TFun") {
		return t.args.some((arg) => occursIn(tvar, arg)) || occursIn(tvar, t.ret);
	}
	if (t.type === "TTuple") {
		return t.elements.some((element) => occursIn(tvar, element));
	}

	if (t.type === "TArray") {
		return occursIn(tvar, t.elementType);
	}
	return false;
};

export const unify = (t1: Type, t2: Type): void => {
	if (t1.type === "TTuple" && t2.type === "TTuple") {
		if (t1.elements.length !== t2.elements.length) {
			throw new Error(
				"Tuple type mismatch: " +
					t1.elements.length +
					" and " +
					t2.elements.length
			);
		}
		t1.elements.forEach((element, i) => {
			unify(element, t2.elements[i]!);
		});
		return;
	}
	if (t1.type === "TArray" && t2.type === "TArray") {
		unify(t1.elementType, t2.elementType);
		return;
	}
	if (t1.type === "TFun" && t2.type === "TFun") {
		if (t1.args.length !== t2.args.length) {
			throw new Error(
				"Function type mismatch: " + t1.args.length + " and " + t2.args.length
			);
		}
		t1.args.forEach((arg, i) => {
			unify(arg, t2.args[i]!);
		});
		unify(t1.ret, t2.ret);
		return;
	}
	if (t1.type !== "TVar" && t2.type !== "TVar") {
		if (t1.type !== t2.type) {
			throw new Error("Type mismatch: " + t1.type + " and " + t2.type);
		}
		return;
	}
	if (t1.type === "TVar") {
		if (t1.resolved.value === undefined) {
			if (occursIn(t1, t2)) {
				throw new Error("Infinite type: " + t1.id);
			}
			t1.resolved.value = t2;
			return;
		} else {
			unify(t1.resolved.value, t2);
			return;
		}
	}
	if (t2.type === "TVar") {
		if (t2.resolved.value === undefined) {
			if (occursIn(t2, t1)) {
				throw new Error("Infinite type: " + t2.id);
			}
			t2.resolved.value = t1;
		} else {
			unify(t2.resolved.value, t1);
		}
		return;
	}
};

const resolve = (t: Type): Type => {
	if (t.type === "TVar") {
		if (t.resolved.value === undefined) {
			throw new Error("Unresolved type variable: " + t.id);
		}
		return resolve(t.resolved.value);
	}
	if (t.type === "TFun") {
		return {
			type: "TFun",
			args: t.args.map(resolve),
			ret: resolve(t.ret),
		};
	}
	if (t.type === "TTuple") {
		return {
			type: "TTuple",
			elements: t.elements.map(resolve),
		};
	}
	if (t.type === "TArray") {
		return {
			type: "TArray",
			elementType: resolve(t.elementType),
		};
	}
	return t;
};

export const infer = (ast: Expr): Type => {
	const ctx = createContext();
	const result = inferInternal(ast, ctx);
	return resolve(result);
};

const inferInternal = (ast: Expr, ctx: TypeContext): Type => {
	const { typeEnv, newVar } = ctx;

	if (ast.type === "Number") {
		return { type: "TInt" };
	}
	if (ast.type === "Bool") {
		return { type: "TBool" };
	}
	if (ast.type === "Tuple") {
		return {
			type: "TTuple",
			elements: ast.elements.map((element) => inferInternal(element, ctx)),
		};
	}
	if (ast.type === "ArrayCreate") {
		unify(inferInternal(ast.size, ctx), { type: "TInt" });
		return { type: "TArray", elementType: inferInternal(ast.init, ctx) };
	}
	if (ast.type === "ArrayGet") {
		unify(inferInternal(ast.index, ctx), { type: "TInt" });
		const elementType = newVar();
		const arrayType = inferInternal(ast.array, ctx);
		unify(arrayType, { type: "TArray", elementType });
		return elementType;
	}

	if (ast.type === "ArrayPut") {
		unify(inferInternal(ast.index, ctx), { type: "TInt" });
		const elementType = newVar();
		const arrayType = inferInternal(ast.array, ctx);
		unify(arrayType, { type: "TArray", elementType });
		unify(elementType, inferInternal(ast.value, ctx));
		return { type: "TUnit" };
	}

	if (ast.type === "BinOp") {
		const left = inferInternal(ast.left, ctx);
		const right = inferInternal(ast.right, ctx);
		const arithmeticTypes = ["+", "-", "*", "/"];
		const comparisonTypes = ["<", ">", "<=", ">=", "=", "<>"];
		if (arithmeticTypes.includes(ast.operator)) {
			unify(left, { type: "TInt" });
			unify(right, { type: "TInt" });
			return { type: "TInt" };
		}
		if (comparisonTypes.includes(ast.operator)) {
			unify(left, { type: "TInt" });
			unify(right, { type: "TInt" });
			return { type: "TBool" };
		}
		throw new Error("Unexpected operator: " + ast.operator);
	}
	if (ast.type === "VAR") {
		const varType = typeEnv.get(ast.name);
		if (varType === undefined) {
			throw new Error("Variable not found: " + ast.name);
		}
		return varType;
	}
	if (ast.type === "LET") {
		const value = inferInternal(ast.value, ctx);
		const newEnv = new Map(typeEnv);
		newEnv.set(ast.name, value);
		return inferInternal(ast.body, { ...ctx, typeEnv: newEnv });
	}
	if (ast.type === "LetTuple") {
		const value = inferInternal(ast.value, ctx);
		const elementsTypes = ast.names.map(() => newVar());
		unify(value, { type: "TTuple", elements: elementsTypes });
		const newEnv = new Map(typeEnv);
		ast.names.forEach((name, i) => {
			newEnv.set(name, elementsTypes[i]!);
		});
		return inferInternal(ast.body, { ...ctx, typeEnv: newEnv });
	}
	if (ast.type === "IF") {
		const cond = inferInternal(ast.cond, ctx);
		unify(cond, { type: "TBool" });
		const then_ = inferInternal(ast.then_, ctx);
		const else_ = inferInternal(ast.else_, ctx);
		unify(then_, else_);
		return then_;
	}
	if (ast.type === "UnaryOp") {
		const expr = inferInternal(ast.expr, ctx);
		unify(expr, { type: "TInt" });
		return expr;
	}

	if (ast.type === "LetRec") {
		const argTypes = ast.func.args.map(newVar);
		const retType = newVar();
		const funcType: Type = { type: "TFun", args: argTypes, ret: retType };
		const newEnv = new Map(typeEnv);
		newEnv.set(ast.func.name, funcType);
		ast.func.args.forEach((arg, i) => {
			newEnv.set(arg, argTypes[i]!);
		});
		const newCtx = { ...ctx, typeEnv: newEnv };
		const bodyType = inferInternal(ast.func.body, newCtx);
		unify(retType, bodyType);
		return inferInternal(ast.body, newCtx);
	}
	if (ast.type === "App") {
		const func = inferInternal(ast.func, ctx);
		const argTypes = ast.args.map((arg) => inferInternal(arg, ctx));
		const retType = newVar();
		const expectedFuncType: Type = {
			type: "TFun",
			args: argTypes,
			ret: retType,
		};
		unify(func, expectedFuncType);
		return retType;
	}
	throw new Error("Unexpected AST type");
};
