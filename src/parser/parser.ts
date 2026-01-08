import type { Token } from "../lexer/lexer";

/**
 * 文法 (EBNF):
 *
 * Expr    ::= 'let' IDENT '=' Expr 'in' Expr
 *           | 'if' Expr 'then' Expr 'else' Expr
 *           | Compare
 * Compare ::= Additive (('<' | '>' | '<=' | '>=' | '=' | '<>') Additive)?
 * Additive ::= Term (('+' | '-') Term)*
 * Term    ::= App (('*' | '/') App)*
 * App     ::= Factor Factor*
 * Factor  ::= '-' Factor | Primary
 * Primary ::= NUMBER | BOOL | '(' Expr ')' | IDENT | Tuple
 */

export type FuncDef = { name: string; args: string[]; body: Expr };
export type Expr =
	| { type: "Number"; value: number }
	| { type: "Bool"; value: boolean }
	| { type: "UnaryOp"; operator: "-"; expr: Expr }
	| {
			type: "BinOp";
			left: Expr;
			right: Expr;
			operator: "+" | "-" | "*" | "/" | ">" | ">=" | "<" | "<=" | "<>" | "=";
	  }
	| { type: "VAR"; name: string }
	| { type: "LET"; name: string; value: Expr; body: Expr }
	| { type: "IF"; cond: Expr; then_: Expr; else_: Expr }
	| { type: "App"; func: Expr; args: Expr[] }
	| {
			type: "LetRec";
			func: FuncDef;
			body: Expr;
	  }
	| { type: "Tuple"; elements: Expr[] }
	| { type: "LetTuple"; names: string[]; value: Expr; body: Expr };

type CompareOperator = "<" | ">" | "<=" | ">=" | "=" | "<>";

const compareOperatorMap = new Map<Token["type"], CompareOperator>([
	["LT", "<"],
	["GT", ">"],
	["LE", "<="],
	["GE", ">="],
	["EQ", "="],
	["NEQ", "<>"],
]);

export const parse = (tokens: Token[]): Expr => {
	if (tokens.length === 0) {
		throw new Error("Unexpected end of input");
	}
	let position = 0;

	const currentToken = () => tokens[position];
	const advance = () => position++;

	// Primary ::= NUMBER | BOOL | '(' Expr ')' | IDENT
	const parsePrimary = (): Expr => {
		const token = currentToken();
		if (token?.type === "TRUE") {
			advance();
			return { type: "Bool", value: true };
		}
		if (token?.type === "FALSE") {
			advance();
			return { type: "Bool", value: false };
		}
		if (token?.type === "NUMBER") {
			advance();
			return { type: "Number", value: token.value };
		}
		if (token?.type === "LPAREN") {
			advance();
			const expr = parseExpr();
			if (currentToken()?.type === "COMMA") {
				const elements = [expr];
				while (currentToken()?.type === "COMMA") {
					advance();
					const next = parseExpr();
					elements.push(next);
				}
				if (currentToken()?.type !== "RPAREN") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				return { type: "Tuple", elements };
			}
			if (currentToken()?.type !== "RPAREN") {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			return expr;
		}
		if (token?.type === "IDENT") {
			advance();
			return { type: "VAR", name: token.value };
		}
		throw new Error(`Unexpected token: ${token?.type}`);
	};

	// Factor ::= '-' Factor | Primary
	const parseFactor = (): Expr => {
		if (currentToken()?.type === "MINUS") {
			advance();
			return { type: "UnaryOp", operator: "-", expr: parseFactor() };
		}
		return parsePrimary();
	};

	// App ::= Factor Factor*
	const parseApp = (): Expr => {
		const func = parseFactor();
		const args: Expr[] = [];
		const isArgStart = (t?: Token["type"]) =>
			t === "LPAREN" ||
			t === "IDENT" ||
			t === "NUMBER" ||
			t === "TRUE" ||
			t === "FALSE";
		while (isArgStart(currentToken()?.type)) {
			const arg = parseFactor();
			args.push(arg);
		}
		if (args.length > 0) {
			return { type: "App", func, args };
		}
		return func;
	};

	// Term ::= App (('*' | '/') App)*
	const parseTerm = (): Expr => {
		let left = parseApp();
		while (
			currentToken()?.type === "MULTIPLY" ||
			currentToken()?.type === "DIVIDE"
		) {
			const op = currentToken()?.type === "MULTIPLY" ? "*" : "/";
			advance();
			const right = parseApp();
			left = { type: "BinOp", left, right, operator: op };
		}
		return left;
	};

	// Additive ::= Term (('+' | '-') Term)*
	const parseAdditive = (): Expr => {
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

	// Compare ::= Additive (('<' | '>' | '<=' | '>=' | '=' | '<>') Additive)?
	const parseCompare = (): Expr => {
		let left = parseAdditive();
		while (
			currentToken()?.type === "LT" ||
			currentToken()?.type === "GT" ||
			currentToken()?.type === "LE" ||
			currentToken()?.type === "GE" ||
			currentToken()?.type === "EQ" ||
			currentToken()?.type === "NEQ"
		) {
			const op = compareOperatorMap.get(currentToken()?.type as Token["type"]);
			if (!op) {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			const right = parseAdditive();
			left = { type: "BinOp", left, right, operator: op };
		}
		return left;
	};

	// Expr ::= 'let' ... | 'if' ... | Compare
	const parseExpr = (): Expr => {
		if (currentToken()?.type === "LET") {
			advance();
			const firstToken = currentToken();
			if (firstToken?.type === "REC") {
				const args: string[] = [];
				advance();
				const expectedNameToken = currentToken();
				if (expectedNameToken?.type !== "IDENT") {
					throw new Error(`Unexpected token: ${expectedNameToken?.type}`);
				}
				advance();
				while (currentToken()?.type === "IDENT") {
					const token = currentToken();
					if (token?.type === "IDENT") {
						args.push(token.value);
					}
					advance();
				}
				if (currentToken()?.type !== "EQ") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				const func: FuncDef = {
					name: expectedNameToken.value,
					args: args,
					body: parseExpr(),
				};
				if (currentToken()?.type !== "IN") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				const body = parseExpr();
				return { type: "LetRec", func, body };
			}
			if (firstToken?.type === "LPAREN") {
				//LetTuple
				advance();
				const firstNameToken = currentToken();
				if (firstNameToken?.type !== "IDENT") {
					throw new Error(`Unexpected token: ${firstNameToken?.type}`);
				}
				advance();
				const names: string[] = [firstNameToken.value];
				while (currentToken()?.type === "COMMA") {
					advance();
					const nextNameToken = currentToken();
					if (nextNameToken?.type !== "IDENT") {
						throw new Error(`Unexpected token: ${nextNameToken?.type}`);
					}
					advance();
					names.push(nextNameToken.value);
				}
				if (currentToken()?.type !== "RPAREN") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				if (currentToken()?.type !== "EQ") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				const value = parseExpr();
				if (currentToken()?.type !== "IN") {
					throw new Error(`Unexpected token: ${currentToken()?.type}`);
				}
				advance();
				const body = parseExpr();
				return { type: "LetTuple", names, value, body };
			}
			const name = firstToken?.type === "IDENT" ? firstToken.value : "";
			advance();
			if (currentToken()?.type !== "EQ") {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			const value = parseExpr();
			if (currentToken()?.type !== "IN") {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			const body = parseExpr();
			return { type: "LET", name, value, body };
		}

		if (currentToken()?.type === "IF") {
			advance();
			const cond = parseExpr();
			if (currentToken()?.type !== "THEN") {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			const then_ = parseExpr();
			if (currentToken()?.type !== "ELSE") {
				throw new Error(`Unexpected token: ${currentToken()?.type}`);
			}
			advance();
			const else_ = parseExpr();
			return { type: "IF", cond, then_, else_ };
		}

		return parseCompare();
	};
	return parseExpr();
};
