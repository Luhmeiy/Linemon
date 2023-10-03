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
	{ name: "Go to LakeCity", value: "lakeCity" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
];

const linemonOptions = ["linemonOne", "linemonTwo"];

export class Lake implements LakeMethods {
	constructor(
		private goToGrasslands: () => void,
		private goToLakeCity: () => void,
		private goToForest: () => void,
		private player: PlayerMethods
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
		switch (answer.selectedOption) {
			case "tallGrass":
				goToTallGrass(linemonOptions, this.player, this.goToLake);
				break;
			case "lakeCity":
				this.goToLakeCity();
				break;
			case "grasslands":
				this.goToGrasslands();
				break;
			case "forest":
				this.goToForest();
				break;
			default:
				getMenu(this.player, this.goToLake);
				break;
		}
	};
}
