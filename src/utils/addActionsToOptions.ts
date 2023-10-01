import inquirer from "inquirer";
import type { Option } from "../types/Option.js";

export const addActionsToOptions = (options: Option) => {
	const actions = [
		new inquirer.Separator(),
		{ name: "Open inventory", value: "inventory" },
	];

	//@ts-ignore
	return options.concat(actions);
};
