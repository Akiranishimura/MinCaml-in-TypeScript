export type Token =
	| { type: "NUMBER"; value: number }
	| { type: "PLUS" }
	| { type: "MINUS" }
	| { type: "MULTIPLY" }
	| { type: "DIVIDE" }
	| { type: "LPAREN" }
	| { type: "RPAREN" }
	| { type: "EOF" };

const isDigit = (char?: string): boolean => {
	if (!char) return false;
	return char.match(/^\d+$/) !== null;
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
		if (isDigit(char)) {
			let value = "";
			while (position < input.length && isDigit(input[position])) {
				value += input[position];
				position++;
			}
			tokens.push({ type: "NUMBER", value: parseInt(value, 10) });
			continue;
		}

		throw new Error(`Unexpected character: ${char}, position: ${position}`);
	}
	tokens.push({ type: "EOF" });
	return tokens;
};
