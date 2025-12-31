import type { Expr } from "../parser/parser";

export const evaluate = (
	ast: Expr,
	env: Map<string, number> = new Map(),
): number => {
	if (ast.type === "Number") {
		return ast.value;
	}
	if (ast.type === "UnaryOp") {
		const operand = evaluate(ast.expr, env);
		return -operand;
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
	if (ast.type === "BinOp") {
		const left = evaluate(ast.left, env);
		const right = evaluate(ast.right, env);
		switch (ast.operator) {
			case "+":
				return left + right;
			case "-":
				return left - right;
			case "*":
				return left * right;
			case "/":
				if (right === 0) {
					throw new Error("Division by zero");
				}
				return left / right;
			default:
				throw new Error("Invalid operator");
		}
	}
	throw new Error("Invalid AST: " + JSON.stringify(ast));
};
