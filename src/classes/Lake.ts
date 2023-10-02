import chalk from "chalk";

import type { LakeMethods } from "../types/LakeMethods.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { goToTallGrass } from "../utils/goToTallGrass.js";

let lakeOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
];

const linemonOptions = ["linemonOne", "linemonTwo"];

export class Lake implements LakeMethods {
	constructor(
		public goToGrasslands: () => void,
		public goToForest: () => void,
		public player: PlayerMethods
	) {
		lakeOptions = addMenuToOptions(lakeOptions);
	}

	goToLake = async () => {
		console.log("\nYou are in the lake.");

		const answer = await createPrompt(
			"Where do you want to go?",
			lakeOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			goToTallGrass(linemonOptions, this.player, this.goToLake);
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		} else if (answer.selectedOption === "forest") {
			this.goToForest();
		} else {
			getMenu(this.player, this.goToLake);
		}
	};
}
