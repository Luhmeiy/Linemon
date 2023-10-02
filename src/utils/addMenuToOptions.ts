import inquirer from "inquirer";
import type { Option } from "../types/Option.js";

export const addMenuToOptions = (options: Option) => {
	const actions = [new inquirer.Separator(), { name: "Menu", value: "menu" }];

	//@ts-ignore
	return options.concat(actions);
};
