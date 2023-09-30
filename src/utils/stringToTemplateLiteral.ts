import chalk from "chalk";

import type { Option } from "../types/Option.js";

export const stringToTemplateLiteral = (options: Option) => {
	return options.map((option) => {
		return {
			name: eval("`" + option.name + "`"),
			value: option.value,
		};
	});
};
