import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { existsSync, mkdirSync, writeFileSync } from "fs";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";

const actionsOptions = [
	{ name: "player", value: "player" },
	{ name: "Team", value: "team" },
	{ name: "Inventory", value: "inventory" },
	{ name: "Save", value: "save" },
	{ name: "Go back", value: "back" },
];

export const getMenu = async (
	player: PlayerMethods,
	returnFunction: () => void
) => {
	const startMenu = async () => {
		actionsOptions[0].name = player.getName();

		const answer = await createPrompt("Choose an option: ", actionsOptions);

		switch (answer.selectedOption) {
			case "player":
				return player.getStatus(startMenu);
			case "team":
				return player.getTeam(startMenu);
			case "inventory":
				return player.getInventory(startMenu);
			case "save":
				if (!existsSync("./src/save")) mkdirSync("./src/save");
				writeFileSync("./src/save/save.json", JSON.stringify(player));
				await delayMessage("Game saved!\n");
				return getMenu(player, returnFunction);
			case "back":
				return returnFunction();
		}
	};

	startMenu();
};
