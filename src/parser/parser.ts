import type { Token } from "../lexer/lexer";

/**
 * 四則演算の文法 (EBNF):
 *
 * Expr   ::= 'let' IDENT '=' Expr 'in' Expr | Term (('+' | '-') Term)*
 * Term   ::= Factor (('*' | '/') Factor)*
 * Factor ::= NUMBER | '(' Expr ')' | IDENT
 */

export type Expr =
	| { type: "Number"; value: number }
	| { type: "UnaryOp"; operator: "-"; expr: Expr }
	| { type: "BinOp"; left: Expr; right: Expr; operator: "+" | "-" | "*" | "/" }
	| { type: "VAR"; name: string }
	| { type: "LET"; name: string; value: Expr; body: Expr };

export const parse = (tokens: Token[]): Expr => {
	if (tokens.length === 0) {
		throw new Error("Unexpected end of input");
	}
	let position = 0;

	const currentToken = () => tokens[position];
	const advance = () => position++;

	const parseFactor = (): Expr => {
		const token = currentToken();
		if (token?.type === "MINUS") {
			advance();
			return { type: "UnaryOp", operator: "-", expr: parseFactor() };
		} else if (token?.type === "NUMBER") {
			advance();
			return { type: "Number", value: token.value };
		} else if (token?.type === "LPAREN") {
			advance();
			const expr = parseExpr();
			if (currentToken()?.type !== "RPAREN") {
				throw new Error("Unexpected token: " + currentToken()?.type);
			}
			advance();
			return expr;
		} else if (token?.type === "IDENT") {
			advance();
			return { type: "VAR", name: token.value };
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
		if (currentToken()?.type === "LET") {
			advance();
			const expectedNameToken = currentToken();
			const name =
				expectedNameToken?.type === "IDENT" ? expectedNameToken.value : "";
			advance();
			if (currentToken()?.type !== "EQ") {
				throw new Error("Unexpected token: " + currentToken()?.type);
			}
			advance();
			const value = parseExpr();
			if (currentToken()?.type !== "IN") {
				throw new Error("Unexpected token: " + currentToken()?.type);
			}
			advance();
			const body = parseExpr();
			return { type: "LET", name, value, body };
		}

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
