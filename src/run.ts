import { evaluate } from "./evaluator/evaluator";
import { tokenize } from "./lexer/lexer";
import { parse } from "./parser/parser";

export const run = (input: string) => {
	const tokens = tokenize(input);
	const ast = parse(tokens);
	const result = evaluate(ast);
	return result;
};
