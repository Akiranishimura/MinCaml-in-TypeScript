export type Token =
	// リテラル
	| { type: "NUMBER"; value: number }
	| { type: "TRUE" }
	| { type: "FALSE" }
	//識別子
	| { type: "IDENT"; value: string } //ex) x, foo
	//キーワード
	| { type: "LET" }
	| { type: "REC" }
	| { type: "IN" }
	| { type: "IF" }
	| { type: "THEN" }
	| { type: "ELSE" }
	| { type: "COMMA" }
	| { type: "ARRAY_CREATE" }
	| { type: "DOT_LPAREN" }
	//演算子
	| { type: "PLUS" }
	| { type: "MINUS" }
	| { type: "MULTIPLY" }
	| { type: "DIVIDE" }
	| { type: "LPAREN" }
	| { type: "RPAREN" }
	| { type: "EQ" }
	| { type: "LT" }
	| { type: "GT" }
	| { type: "LE" }
	| { type: "GE" }
	| { type: "NEQ" }
	| { type: "LEFT_ARROW" }
	//終端
	| { type: "EOF" };

const isDigit = (char?: string): boolean => {
	if (!char) return false;
	return char.match(/^\d+$/) !== null;
};

const isAlphabet = (char?: string): boolean => {
	if (!char) return false;
	return char.match(/^[a-zA-Z_]+$/) !== null;
};

const keywords = new Map<string, Token["type"]>([
	["let", "LET"],
	["in", "IN"],
	["if", "IF"],
	["then", "THEN"],
	["else", "ELSE"],
	["true", "TRUE"],
	["false", "FALSE"],
	["rec", "REC"],
	["Array.create", "ARRAY_CREATE"],
]);

const toKeywordOrIdent = (value: string): Token =>
	keywords.has(value)
		? ({ type: keywords.get(value) } as Token)
		: { type: "IDENT", value };

export const tokenize = (input: string): Token[] => {
	const tokens: Token[] = [];
	let position = 0;
	while (position < input.length) {
		const char = input[position];
		if (char === " ") {
			position++;
			continue;
		}
		if (char === "+") {
			tokens.push({ type: "PLUS" });
			position++;
			continue;
		}
		if (char === "-") {
			tokens.push({ type: "MINUS" });
			position++;
			continue;
		}
		if (char === "*") {
			tokens.push({ type: "MULTIPLY" });
			position++;
			continue;
		}
		if (char === "/") {
			tokens.push({ type: "DIVIDE" });
			position++;
			continue;
		}
		if (char === "(") {
			tokens.push({ type: "LPAREN" });
			position++;
			continue;
		}
		if (char === ")") {
			tokens.push({ type: "RPAREN" });
			position++;
			continue;
		}

		if (char === "." && input[position + 1] === "(") {
			tokens.push({ type: "DOT_LPAREN" });
			position += 2;
			continue;
		}

		if (char === "=") {
			tokens.push({ type: "EQ" });
			position++;
			continue;
		}

		if (char === "<") {
			const next = input[position + 1];
			if (next === "=") {
				tokens.push({ type: "LE" });
				position += 2;
			} else if (next === ">") {
				tokens.push({ type: "NEQ" });
				position += 2;
			} else if (next === "-") {
				tokens.push({ type: "LEFT_ARROW" });
				position += 2;
			} else {
				tokens.push({ type: "LT" });
				position++;
			}
			continue;
		}

		if (char === ">") {
			const next = input[position + 1];
			if (next === "=") {
				tokens.push({ type: "GE" });
				position += 2;
			} else {
				tokens.push({ type: "GT" });
				position++;
			}
			continue;
		}

		if (char === ",") {
			tokens.push({ type: "COMMA" });
			position++;
			continue;
		}

		if (isDigit(char)) {
			let value = "";
			while (position < input.length && isDigit(input[position])) {
				value += input[position];
				position++;
			}
			tokens.push({ type: "NUMBER", value: parseInt(value, 10) });
			continue;
		}

		if (isAlphabet(char)) {
			let value = "";
			while (
				position < input.length &&
				(isAlphabet(input[position]) || isDigit(input[position]))
			) {
				value += input[position];
				position++;
			}
			if (
				value === "Array" &&
				input.slice(position, position + 7) === ".create"
			) {
				value = "Array.create";
				position += 7;
			}
			tokens.push(toKeywordOrIdent(value));
			continue;
		}

		throw new Error(`Unexpected character: ${char}, position: ${position}`);
	}
	tokens.push({ type: "EOF" });
	return tokens;
};
