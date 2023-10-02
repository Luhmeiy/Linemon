import type { PlayerProps } from "../interfaces/PlayerProps.js";
import { createPrompt } from "./createPrompt.js";

const actionsOptions = [
	{ name: "player", value: "player" },
	{ name: "Team", value: "team" },
	{ name: "Inventory", value: "inventory" },
	{ name: "Go back", value: "back" },
];

export const getMenu = async (
	player: PlayerProps,
	returnFunction: () => void
) => {
	const startMenu = async () => {
		actionsOptions[0].name = player.getName();

		const answer = await createPrompt("Choose an option: ", actionsOptions);

		switch (answer.selectedOption) {
			case "player":
				player.getStatus(startMenu);
				break;
			case "team":
				player.getTeam(startMenu);
				break;
			case "inventory":
				player.getInventory(startMenu);
				break;
			case "back":
				returnFunction();
				break;
		}
	};

	startMenu();
};
