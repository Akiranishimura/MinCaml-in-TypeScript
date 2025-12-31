import type { Expr } from "../parser/parser";

export const evaluate = (ast: Expr): number => {
	if (ast.type === "Number") {
		return ast.value;
	}
	if (ast.type === "UnaryOp") {
		const operand = evaluate(ast.expr);
		return -operand;
	}
	if (ast.type === "BinOp") {
		const left = evaluate(ast.left);
		const right = evaluate(ast.right);
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
