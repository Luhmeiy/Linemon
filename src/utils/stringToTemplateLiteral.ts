import { Chalk } from "chalk";

import type { Option } from "../types/Option.js";

export const stringToTemplateLiteral = (options: Option) => {
	const chalk = new Chalk();

	return options.map(({ name, value }) => {
		return {
			name: eval("`" + name + "`"),
			value: value,
		};
	});
};
