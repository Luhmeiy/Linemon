import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { Option } from "@/types/Option.js";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getRoute } from "./getRoute.js";

const linemonOptions = [
	{ name: "Status", value: "status" },
	{ name: "Description", value: "description" },
	{ name: "Swap positions", value: "swap" },
	{ name: "", value: "switch" },
	{ name: "Release", value: "release" },
	{ name: "Go back", value: "back" },
];

const defaultOption = { name: "Go back", value: "back" };

const createOptions = (linemons: LinemonProps[]) => {
	return linemons.map((linemon) => {
		const isFainted = linemon.status.currentHp === 0;

		return {
			name: `${linemon.info.name} ${isFainted ? "[fainted]" : ""}`,
			value: `${linemon.referenceId}`,
		};
	});
};

export const createLinemonsMenu = async (
	origin: string,
	linemons: LinemonProps[],
	addFunction: (linemon: LinemonProps) => void,
	switchFunction: (
		firstLinemonId: string,
		secondLinemonId: string
	) => LinemonProps[],
	removeFunction: (linemonId: string) => LinemonProps[],
	url: string
) => {
	let noLinemonsMessage;

	switch (origin) {
		case "team":
			linemonOptions[3].name = "Send to PC";
			noLinemonsMessage = "No Linemons caught yet.\n";
			break;
		case "pc":
			linemonOptions[3].name = "Add to team";
			noLinemonsMessage = "No Linemons in PC.";
			break;
	}

	if (linemons.length === 0) {
		await delayMessage(noLinemonsMessage!);
		return await getRoute(url);
	}

	const availableLinemons: Option = [
		...createOptions(linemons),
		defaultOption,
	];

	const linemonId = await createPrompt(
		"Choose a Linemon: ",
		availableLinemons
	);

	if (linemonId === "back") {
		return await getRoute(url);
	}

	const linemon = linemons.find(
		(linemon) => linemon.referenceId === linemonId
	);

	const linemonAnswer = await createPrompt(linemon.info.name, linemonOptions);

	switch (linemonAnswer) {
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
		case "swap":
			const filteredLinemons = linemons.filter(
				(arrayLinemon) =>
					arrayLinemon.referenceId !== linemon.referenceId
			);

			const availableLinemons = [...createOptions(filteredLinemons)];

			const answer = await createPrompt(
				"Choose a Linemon to swap positions: ",
				availableLinemons
			);

			linemons = switchFunction(linemonId, answer);
			break;
		case "switch":
			linemons = removeFunction(linemonId);
			await addFunction(linemon);
			break;
		case "release":
			await delayMessage(`${linemon.info.name} was released.\n`);
			linemons = removeFunction(linemonId);
			break;
	}

	createLinemonsMenu(
		origin,
		linemons,
		addFunction,
		switchFunction,
		removeFunction,
		url
	);
};
