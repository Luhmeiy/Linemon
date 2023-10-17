import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { searchForLinemon } from "../../utils/searchForLinemon.js";

let desertOptions = [
	{ name: "Walk around", value: "walk" },
	{ name: "Go to mountain", value: "mountain" },
];

const linemonOptions = [
	"sandshifter",
	"firebeast",
	"firepup",
	"zephyrete",
	"aerowind",
	"guslet",
];

export class Desert {
	constructor(
		private goToMountain: (direction: "top" | "bottom") => void,
		private player: PlayerMethods
	) {
		desertOptions = addMenuToOptions(desertOptions);
	}

	goToDesert = async () => {
		console.log("\nYou are in the desert.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			desertOptions
		);

		await delayMessage(null);
		switch (selectedOption) {
			case "walk":
				return searchForLinemon(
					linemonOptions,
					80,
					{ min: 15, max: 20 },
					"desert",
					this.player,
					this.goToDesert
				);
			case "mountain":
				return this.goToMountain("bottom");
			default:
				return getMenu(this.player, this.goToDesert);
		}
	};
}
