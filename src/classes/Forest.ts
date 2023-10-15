import chalk from "chalk";

import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { searchForLinemon } from "../utils/searchForLinemon.js";

let forestOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

const linemonOptions = [
	"leaflet",
	"greenling",
	"seedling",
	"seedlet",
	"normalcub",
	"breezlet",
];

export class Forest {
	constructor(
		private goToGrasslands: () => void,
		private goToLake: () => void,
		private player: PlayerMethods
	) {
		forestOptions = addMenuToOptions(forestOptions);
	}

	goToForest = async () => {
		console.log("\nYou are in the forest.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			forestOptions
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
					this.goToForest
				);
			case "grasslands":
				return this.goToGrasslands();
			case "lake":
				return this.goToLake();
			default:
				return getMenu(this.player, this.goToForest);
		}
	};
}
