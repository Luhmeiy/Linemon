import chalk from "chalk";

import type { GrasslandsMethods } from "../types/GrasslandsMethods.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { searchForLinemon } from "../utils/searchForLinemon.js";

let grasslandsOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: "Go to city", value: "city" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

const linemonOptions = ["linemonOne", "linemonTwo"];

export class Grasslands implements GrasslandsMethods {
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

		const answer = await createPrompt(
			"Where do you want to go?",
			grasslandsOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			searchForLinemon(
				linemonOptions,
				100,
				"tallGrass",
				this.player,
				this.goToGrasslands
			);
		} else if (answer.selectedOption === "city") {
			this.goToCity();
		} else if (answer.selectedOption === "forest") {
			this.goToForest();
		} else if (answer.selectedOption === "lake") {
			this.goToLake();
		} else {
			getMenu(this.player, this.goToGrasslands);
		}
	};
}
