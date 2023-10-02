import chalk from "chalk";

import type { ForestMethods } from "../types/ForestMethods.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { goToTallGrass } from "../utils/goToTallGrass.js";

let forestOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

const linemonOptions = ["linemonOne", "linemonTwo"];

export class Forest implements ForestMethods {
	constructor(
		private goToGrasslands: () => void,
		private goToLake: () => void,
		private player: PlayerMethods
	) {
		forestOptions = addMenuToOptions(forestOptions);
	}

	goToForest = async () => {
		console.log("\nYou are in the forest.");

		const answer = await createPrompt(
			"Where do you want to go?",
			forestOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			goToTallGrass(linemonOptions, this.player, this.goToForest);
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		} else if (answer.selectedOption === "lake") {
			this.goToLake();
		} else {
			getMenu(this.player, this.goToForest);
		}
	};
}
