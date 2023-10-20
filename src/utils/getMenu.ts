import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { existsSync, mkdirSync, writeFileSync } from "fs";
import moment from "moment";

import { main } from "../app.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";

const actionsOptions = [
	{ name: "player", value: "player" },
	{ name: "Team", value: "team" },
	{ name: "Inventory", value: "inventory" },
	{ name: "Save", value: "save" },
	{ name: "Exit game", value: "exit" },
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

				const date = moment();
				const currentData = date.format("YYYYMMDD-HHmmss");

				writeFileSync(
					`./src/save/${currentData}.json`,
					JSON.stringify(player)
				);

				await delayMessage("Game saved!\n");
				return getMenu(player, returnFunction);
			case "exit":
				const response = await createPrompt(
					"Are you sure you want to exit? All unsaved progress will be lost.",
					[
						{ name: "Yes", value: "yes" },
						{ name: "No", value: "no" },
					]
				);

				if (response.selectedOption === "yes") {
					return main();
				}

				return getMenu(player, returnFunction);
			case "back":
				return returnFunction();
		}
	};

	startMenu();
};
