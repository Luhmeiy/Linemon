import chalk from "chalk";

import type { ForestProps } from "../interfaces/ForestProps.js";

import { addActionsToOptions } from "../utils/addActionsToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getActionConditions } from "../utils/getActionConditions.js";
import { goToTallGrass } from "../utils/goToTallGrass.js";

let forestOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

export class Forest implements ForestProps {
	constructor(
		public goToGrasslands: ForestProps["goToGrasslands"],
		public goToLake: ForestProps["goToLake"],
		public player: ForestProps["player"]
	) {
		forestOptions = addActionsToOptions(forestOptions, this.player.name);
	}

	goToForest = async () => {
		console.log("\nYou are in the forest.");

		const answer = await createPrompt(
			"Where do you want to go?",
			forestOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			goToTallGrass(this.goToForest);
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		} else if (answer.selectedOption === "lake") {
			this.goToLake();
		} else {
			getActionConditions(answer, this.player, this.goToForest);
		}
	};
}
