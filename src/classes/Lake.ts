import chalk from "chalk";

import type { LakeProps } from "../interfaces/LakeProps.js";

import { addActionsToOptions } from "../utils/addActionsToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getActionConditions } from "../utils/getActionConditions.js";
import { goToTallGrass } from "../utils/goToTallGrass.js";

let lakeOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
];

export class Lake implements LakeProps {
	constructor(
		public goToGrasslands: LakeProps["goToGrasslands"],
		public goToForest: LakeProps["goToForest"],
		public player: LakeProps["player"]
	) {
		lakeOptions = addActionsToOptions(lakeOptions, this.player.name);
	}

	goToLake = async () => {
		console.log("\nYou are in the lake.");

		const answer = await createPrompt(
			"Where do you want to go?",
			lakeOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			goToTallGrass(this.goToLake);
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		} else if (answer.selectedOption === "forest") {
			this.goToForest();
		} else {
			getActionConditions(answer, this.player, this.goToLake);
		}
	};
}
