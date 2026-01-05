export type Type =
	| { type: "TInt" }
	| { type: "TBool" }
	| { type: "TVar"; id: number; resolved: { value?: Type } }
	| { type: "TFun"; args: Type[]; ret: Type };
