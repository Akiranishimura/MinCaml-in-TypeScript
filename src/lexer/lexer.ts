export type Token =
	| { type: "NUMBER"; value: number }
	| { type: "PLUS" }
	| { type: "MINUS" }
	| { type: "MULTIPLY" }
	| { type: "DIVIDE" }
	| { type: "LPAREN" }
	| { type: "RPAREN" }
	| { type: "EOF" }
	| { type: "LET" }
	| { type: "EQ" }
	| { type: "IN" }
	| { type: "IDENT"; value: string }; //ex) x, foo

const isDigit = (char?: string): boolean => {
	if (!char) return false;
	return char.match(/^\d+$/) !== null;
};

const isAlphabet = (char?: string): boolean => {
	if (!char) return false;
	return char.match(/^[a-zA-Z]+$/) !== null;
};

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

		if (char === "=") {
			tokens.push({ type: "EQ" });
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
			if (value === "let") {
				tokens.push({ type: "LET" });
			} else if (value === "in") {
				tokens.push({ type: "IN" });
			} else {
				tokens.push({ type: "IDENT", value });
			}
			continue;
		}

		throw new Error(`Unexpected character: ${char}, position: ${position}`);
	}
	tokens.push({ type: "EOF" });
	return tokens;
};
