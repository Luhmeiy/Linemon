import { Separator } from "@inquirer/select";
import type { Option } from "../types/Option.js";

export const addMenuToOptions = (options: Option) => {
	const actions = [new Separator(), { name: "Menu", value: "menu" }];

	//@ts-ignore
	return options.concat(actions);
};
