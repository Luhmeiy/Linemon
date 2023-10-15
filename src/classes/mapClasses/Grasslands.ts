import chalk from "chalk";

import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { searchForLinemon } from "../../utils/searchForLinemon.js";

let grasslandsOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: "Go to city", value: "city" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

const linemonOptions = [
	"groundling",
	"earthlet",
	"normfang",
	"normalite",
	"normlet",
	"greenling",
];

export class Grasslands {
	constructor(
		private goToCity: () => void,
		private goToForest: () => void,
		private goToLake: () => void,
		private player: PlayerMethods
	) {
		grasslandsOptions = addMenuToOptions(grasslandsOptions);
	}

	goToGrasslands = async () => {
		console.log("\nYou are in the grasslands.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			grasslandsOptions
		);

		await delayMessage(null);
		switch (selectedOption) {
			case "tallGrass":
				return searchForLinemon(
					linemonOptions,
					100,
					{ min: 8, max: 15 },
					"tallGrass",
					this.player,
					this.goToGrasslands
				);
			case "city":
				return this.goToCity();
			case "forest":
				return this.goToForest();
			case "lake":
				return this.goToLake();
			default:
				return getMenu(this.player, this.goToGrasslands);
		}
	};
}
