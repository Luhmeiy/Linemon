import type { Option } from "../types/Option.js";
import select from "@inquirer/select";

export const createPrompt = async (message: string, choices: Option) => {
	return await select({
		message,
		choices,
	});
};
