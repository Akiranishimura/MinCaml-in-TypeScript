import { evaluate } from "./evaluator/evaluator";
import { tokenize } from "./lexer/lexer";
import { parse } from "./parser/parser";
import { infer } from "./typecheck/typecheck";

export const run = (input: string) => {
	const tokens = tokenize(input);
	const ast = parse(tokens);
	infer(ast); // 型チェック（エラーがあればthrow）
	const result = evaluate(ast);
	return result;
};
