import inquirer from "inquirer";
import type { Option } from "../types/Option.js";

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
