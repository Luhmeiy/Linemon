import chalk from "chalk";

import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { searchForLinemon } from "../../utils/searchForLinemon.js";

let caveOptions = [
	{ name: `Walk around`, value: "walk" },
	{ name: "Go to MountainCity", value: "mountainCity" },
	{ name: `Go to ${chalk.yellow("desert")}`, value: "desert" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
];

const linemonOptions = [
	"firebeast",
	"firepup",
	"fireling",
	"fireball",
	"firesprite",
	"terramite",
	"groundling",
	"terraclysm",
];

export class Cave {
	constructor(
		private goToMountainCity: () => void,
		private goToDesert: () => void,
		private goToForest: () => void,
		private player: PlayerMethods
	) {
		caveOptions = addMenuToOptions(caveOptions);
	}

	goToCave = async () => {
		console.log("\nYou are in the cave.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			caveOptions
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
					this.goToCave
				);
			case "mountainCity":
				return this.goToMountainCity();
			case "desert":
				return this.goToDesert();
			case "forest":
				return this.goToForest();
			default:
				return getMenu(this.player, this.goToCave);
		}
	};
}
