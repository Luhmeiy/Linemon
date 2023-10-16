import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { searchForLinemon } from "../../utils/searchForLinemon.js";

let mountainPeakOptions = [
	{ name: "Walk around", value: "walk" },
	{ name: "Go to MountainCity", value: "mountainCity" },
];

const linemonOptions = [
	"sparkling",
	"shockling",
	"voltling",
	"sparklet",
	"thundertail",
	"zephyrwing",
	"guslet",
	"breezlet",
	"zephyrete",
];

export class MountainPeak {
	constructor(
		private goToMountainCity: () => void,
		private player: PlayerMethods
	) {
		mountainPeakOptions = addMenuToOptions(mountainPeakOptions);
	}

	goToMountainPeak = async () => {
		console.log("\nYou are in the mountain peak.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			mountainPeakOptions
		);

		await delayMessage(null);
		switch (selectedOption) {
			case "walk":
				return searchForLinemon(
					linemonOptions,
					80,
					{ min: 15, max: 20 },
					"mountain",
					this.player,
					this.goToMountainPeak
				);
			case "mountainCity":
				return this.goToMountainCity();
			default:
				return getMenu(this.player, this.goToMountainPeak);
		}
	};
}
