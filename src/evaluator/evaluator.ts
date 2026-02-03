import type { Expr } from "../parser/parser";

export type Value = number | boolean | Closure | Tuple | MinCamlArray | null;
type Env = Map<string, Value>;
type Closure = { type: "Closure"; args: string[]; body: Expr; env: Env };
type Tuple = { type: "Tuple"; elements: Value[] };
type MinCamlArray = { type: "Array"; elements: Value[] };

const isClosure = (value: Value): value is Closure => {
	return (
		typeof value === "object" && value !== null && value.type === "Closure"
	);
};

const isTuple = (value: Value): value is Tuple => {
	return typeof value === "object" && value !== null && value.type === "Tuple";
};

const isArray = (value: Value): value is MinCamlArray => {
	return typeof value === "object" && value !== null && value.type === "Array";
};
const evalNumber = (ast: Expr, env: Env): number => {
	const v = evaluate(ast, env);
	if (typeof v !== "number") {
		throw new Error(`Expected number, got ${typeof v}`);
	}
	return v;
};

const evalBool = (ast: Expr, env: Env): boolean => {
	const v = evaluate(ast, env);
	if (typeof v !== "boolean") {
		throw new Error("Expected boolean, got " + typeof v);
	}
	return v;
};

export const evaluate = (ast: Expr, env: Env = new Map()): Value => {
	if (ast.type === "Number") {
		return ast.value;
	}
	if (ast.type === "Bool") {
		return ast.value;
	}
	if (ast.type === "Tuple") {
		return {
			type: "Tuple",
			elements: ast.elements.map((e) => evaluate(e, env)),
		};
	}

	if (ast.type === "ArrayCreate") {
		const size = evalNumber(ast.size, env);
		const init = evaluate(ast.init, env);
		return {
			type: "Array",
			elements: new Array(size).fill(init),
		};
	}

	if (ast.type === "ArrayGet") {
		const expectedArray = evaluate(ast.array, env);
		if (!isArray(expectedArray)) {
			throw new Error(
				"Expected array, got " +
					(expectedArray === null ? "null" : typeof expectedArray),
			);
		}
		const array = expectedArray.elements;
		const index = evalNumber(ast.index, env);
		if (index < 0 || index >= array.length) {
			throw new Error("Array index out of bounds");
		}
		return array[index]!;
	}

	if (ast.type === "ArrayPut") {
		const expectedArray = evaluate(ast.array, env);
		if (!isArray(expectedArray)) {
			throw new Error(
				"Expected array, got " +
					(expectedArray === null ? "null" : typeof expectedArray),
			);
		}
		const array = expectedArray.elements;
		const index = evalNumber(ast.index, env);
		if (index < 0 || index >= array.length) {
			throw new Error("Array index out of bounds");
		}
		const value = evaluate(ast.value, env);
		array[index] = value;
		return null;
	}

	if (ast.type === "UnaryOp") {
		return -evalNumber(ast.expr, env);
	}
	if (ast.type === "VAR") {
		const value = env.get(ast.name);
		if (value === undefined) {
			throw new Error("Variable not found: " + ast.name);
		}
		return value;
	}
	if (ast.type === "LET") {
		const value = evaluate(ast.value, env);
		const newEnv = new Map(env);
		newEnv.set(ast.name, value);
		return evaluate(ast.body, newEnv);
	}
	if (ast.type === "LetRec") {
		const newEnv = new Map(env);
		const closure: Closure = {
			type: "Closure",
			args: ast.func.args,
			body: ast.func.body,
			env: newEnv,
		};
		newEnv.set(ast.func.name, closure);
		return evaluate(ast.body, newEnv);
	}
	if (ast.type === "LetTuple") {
		const value = evaluate(ast.value, env);
		if (!isTuple(value)) {
			throw new Error(
				"Expected tuple, got " + (value === null ? "null" : typeof value),
			);
		}
		const newEnv = new Map(env);
		ast.names.forEach((name, i) => {
			if (value.elements[i] === undefined) {
				throw new Error("Expected element, got undefined for element " + name);
			}
			newEnv.set(name, value.elements[i]);
		});
		return evaluate(ast.body, newEnv);
	}

	if (ast.type === "App") {
		const func = evaluate(ast.func, env);
		if (!isClosure(func)) {
			throw new Error(
				"Expected closure, got " + (func === null ? "null" : typeof func),
			);
		}
		const argValues = ast.args.map((arg) => evaluate(arg, env));
		const newEnv = new Map(func.env);
		func.args.forEach((argName, i) => {
			if (argValues[i] === undefined) {
				throw new Error(
					"Expected argument, got undefined for argument " + argName,
				);
			}
			newEnv.set(argName, argValues[i]);
		});

		return evaluate(func.body, newEnv);
	}

	if (ast.type === "IF") {
		const cond = evalBool(ast.cond, env);
		return evaluate(cond ? ast.then_ : ast.else_, env);
	}
	if (ast.type === "BinOp") {
		switch (ast.operator) {
			case "+":
				return evalNumber(ast.left, env) + evalNumber(ast.right, env);
			case "-":
				return evalNumber(ast.left, env) - evalNumber(ast.right, env);
			case "*":
				return evalNumber(ast.left, env) * evalNumber(ast.right, env);
			case "/": {
				const right = evalNumber(ast.right, env);
				if (right === 0) {
					throw new Error("Division by zero");
				}
				return evalNumber(ast.left, env) / right;
			}
			case "<":
				return evalNumber(ast.left, env) < evalNumber(ast.right, env);
			case ">":
				return evalNumber(ast.left, env) > evalNumber(ast.right, env);
			case "<=":
				return evalNumber(ast.left, env) <= evalNumber(ast.right, env);
			case ">=":
				return evalNumber(ast.left, env) >= evalNumber(ast.right, env);
			case "=":
				return evalNumber(ast.left, env) === evalNumber(ast.right, env);
			case "<>":
				return evalNumber(ast.left, env) !== evalNumber(ast.right, env);
			default:
				throw new Error("Invalid operator");
		}
	}
	throw new Error("Invalid AST: " + JSON.stringify(ast));
};
