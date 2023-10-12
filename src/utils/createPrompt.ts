import type { Option } from "../types/Option.js";
import inquirer from "inquirer";

export const createPrompt = async (message: string, choices: Option) => {
	return await inquirer.prompt([
		{
			type: "list",
			name: "selectedOption",
			message,
			choices,
		},
	]);
};
