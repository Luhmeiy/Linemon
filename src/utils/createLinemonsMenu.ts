import type { LinemonProps } from "../interfaces/LinemonProps.js";
import type { Option } from "../types/Option.js";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";

const linemonOptions = [
	{ name: "Status", value: "status" },
	{ name: "Description", value: "description" },
	{ name: "", value: "switch" },
	{ name: "Release", value: "release" },
	{ name: "Go back", value: "back" },
];

const defaultOption = { name: "Go back", value: "back" };

const createOptions = (linemons: LinemonProps[]) => {
	return linemons.map((linemon, i) => {
		return {
			name: linemon.info.name,
			value: `${i}`,
		};
	});
};

export const createLinemonsMenu = async (
	origin: string,
	linemons: LinemonProps[],
	addFunction: (linemon: LinemonProps) => void,
	removeFunction: (linemonId: number) => void,
	returnFunction: () => void
) => {
	let noLinemonsMessage;

	switch (origin) {
		case "team":
			linemonOptions[2].name = "Send to PC";
			noLinemonsMessage = "No Linemons caught yet.\n";
			break;
		case "pc":
			linemonOptions[2].name = "Add to team";
			noLinemonsMessage = "No Linemons in PC.";
			break;
	}

	if (linemons.length === 0) {
		await delayMessage(noLinemonsMessage!);
		return returnFunction();
	}

	const availableLinemons: Option = [
		...createOptions(linemons),
		defaultOption,
	];

	const answer = await createPrompt("Choose a Linemon: ", availableLinemons);

	if (answer.selectedOption === "back") {
		return returnFunction();
	}

	const linemonId = Number(answer.selectedOption);
	const linemon = linemons[linemonId];

	const linemonAnswer = await createPrompt(linemon.info.name, linemonOptions);

	switch (linemonAnswer.selectedOption) {
		case "status":
			await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
LVL: ${linemon.info.lvl} (${linemon.info.xp}/${linemon.info.xpToNextLevel})
ATK: ${linemon.status.atk}
DEF: ${linemon.status.def}
SPD: ${linemon.status.spd}\n`);
			break;
		case "description":
			await delayMessage(
				`${linemon.info.name}: ${linemon.info.description}\n`
			);
			break;
		case "switch":
			removeFunction(linemonId);
			await addFunction(linemon);
			break;
		case "release":
			await delayMessage(`${linemon.info.name} was released.\n`);
			removeFunction(linemonId);
			break;
	}

	createLinemonsMenu(
		origin,
		linemons,
		addFunction,
		removeFunction,
		returnFunction
	);
};
