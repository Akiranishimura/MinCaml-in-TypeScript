import type { Expr } from "../parser/parser";

export type Type =
	| { type: "TInt" }
	| { type: "TBool" }
	| { type: "TVar"; id: number; resolved: { value?: Type } }
	| { type: "TFun"; args: Type[]; ret: Type };

let nextVarId = 0;

const newVar = (): Type => {
	return { type: "TVar", id: nextVarId++, resolved: { value: undefined } };
};

export const unify = (t1: Type, t2: Type): void => {
	if (t1.type !== "TVar" && t2.type !== "TVar") {
		if (t1.type !== t2.type) {
			throw new Error("Type mismatch: " + t1.type + " and " + t2.type);
		}
		return;
	}
	if (t1.type === "TVar") {
		if (t1.resolved.value === undefined) {
			t1.resolved.value = t2;
		}
	}
};

const resolve = (t: Type): Type => {
	if (t.type === "TVar") {
		if (t.resolved.value === undefined) {
			throw new Error("Unresolved type variable: " + t.id);
		}
		return resolve(t.resolved.value);
	}
	return t;
};

export const infer = (
	ast: Expr,
	typeEnv: Map<string, Type> = new Map(),
): Type => {
	if (ast.type === "Number") {
		return { type: "TInt" };
	}
	if (ast.type === "Bool") {
		return { type: "TBool" };
	}
	if (ast.type === "BinOp") {
		const left = infer(ast.left, typeEnv);
		const right = infer(ast.right, typeEnv);
		const arithmeticTypes = ["+", "-", "*", "/"];
		const comparisonTypes = ["<", ">", "<=", ">=", "=", "<>"];
		if (arithmeticTypes.includes(ast.operator)) {
			unify(left, { type: "TInt" });
			unify(right, { type: "TInt" });
			return { type: "TInt" };
		}
		if (comparisonTypes.includes(ast.operator)) {
			if (left.type !== "TInt" || right.type !== "TInt") {
				throw new Error(
					"Expected TInt, got " + left.type + " or " + right.type,
				);
			}
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
		const value = infer(ast.value, typeEnv);
		const newEnv = new Map(typeEnv);
		newEnv.set(ast.name, value);
		return infer(ast.body, newEnv);
	}
	if (ast.type === "IF") {
		const cond = infer(ast.cond, typeEnv);
		if (cond.type !== "TBool") {
			throw new Error("Expected TBool, got " + cond.type);
		}
		const then_ = infer(ast.then_, typeEnv);
		const else_ = infer(ast.else_, typeEnv);
		if (then_.type !== else_.type) {
			throw new Error(
				"Expected same type, got " + then_.type + " and " + else_.type,
			);
		}
		return then_;
	}
	if (ast.type === "UnaryOp") {
		const expr = infer(ast.expr, typeEnv);
		if (expr.type !== "TInt") {
			throw new Error("Expected TInt, got " + expr.type);
		}
		return { type: "TInt" };
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
		const bodyType = infer(ast.func.body, newEnv);
		unify(retType, bodyType);
		return infer(ast.body, newEnv);
	}
	if (ast.type === "App") {
		const func = infer(ast.func, typeEnv);
		if (func.type !== "TFun") {
			throw new Error("Expected TFun, got " + func.type);
		}
		const args = ast.args.map((arg) => infer(arg, typeEnv));
		func.args.forEach((arg, i) => {
			unify(args[i]!, arg);
		});
		return resolve(func.ret);
	}
	throw new Error("Unexpected AST type");
};
