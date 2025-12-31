	test("変数宣言をトークン化できる", () => {
		const tokens = tokenize("let x = 1");
		expect(tokens).toEqual([
			{ type: "LET" },
			{ type: "IDENT", value: "x" },
			{ type: "EQ" },
			{ type: "NUMBER", value: 1 },
			{ type: "EOF" },