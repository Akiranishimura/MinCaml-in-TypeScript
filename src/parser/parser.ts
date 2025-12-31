import type { Token } from "../lexer/lexer";

/**
 * 四則演算の文法 (EBNF):
 *
 * Expr   ::= Term (('+' | '-') Term)*
 * Term   ::= Factor (('*' | '/') Factor)*
 * Factor ::= NUMBER | '(' Expr ')'
 */

export type Expr =
	| { type: "Number"; value: number }
	| { type: "BinOp"; left: Expr; right: Expr; operator: "+" | "-" | "*" | "/" };

export const parse = (tokens: Token[]): Expr => {
	if (tokens.length === 0) {
		throw new Error("Unexpected end of input");
	}
	let position = 0;

	const currentToken = () => tokens[position];
	const advance = () => position++;

	const parseFactor = (): Expr => {
		const token = currentToken();
		advance();
		if (token?.type === "NUMBER") {
			return { type: "Number", value: token.value };
		} else if (token?.type === "LPAREN") {
			const expr = parseExpr();
			if (currentToken()?.type !== "RPAREN") {
				throw new Error("Unexpected token: " + currentToken()?.type);
			}
			advance();
			return expr;
		}
		throw new Error("Unexpected token: " + token?.type);
	};

	const parseTerm = (): Expr => {
		let left = parseFactor();
		while (
			currentToken()?.type === "MULTIPLY" ||
			currentToken()?.type === "DIVIDE"
		) {
			const op = currentToken()?.type === "MULTIPLY" ? "*" : "/";
			advance();
			const right = parseFactor();
			left = { type: "BinOp", left, right, operator: op };
		}
		return left;
	};
	const parseExpr = (): Expr => {
		let left = parseTerm();
		while (
			currentToken()?.type === "PLUS" ||
			currentToken()?.type === "MINUS"
		) {
			const op = currentToken()?.type === "PLUS" ? "+" : "-";
			advance();
			const right = parseTerm();
			left = { type: "BinOp", left, right, operator: op };
		}
		return left;
	};
	return parseExpr();
};
