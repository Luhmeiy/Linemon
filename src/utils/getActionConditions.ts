import type { PlayerProps } from "../interfaces/PlayerProps.js";

export const getActionConditions = (
	answer: any,
	player: PlayerProps,
	returnFunction: () => void
) => {
	if (answer.selectedOption === "player") {
		player.getStatus(returnFunction);
	} else if (answer.selectedOption === "inventory") {
		player.getInventory(returnFunction);
	}
};
