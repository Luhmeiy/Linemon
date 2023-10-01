import inquirer from "inquirer";
import type { Option } from "../types/Option.js";

export const addActionsToOptions = (options: Option, name: string) => {
	const actions = [
		new inquirer.Separator(),
		{ name: name, value: "player" },
		{ name: "Open inventory", value: "inventory" },
	];

	//@ts-ignore
	return options.concat(actions);
};
