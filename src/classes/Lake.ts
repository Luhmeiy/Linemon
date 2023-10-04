import chalk from "chalk";

import type { LakeMethods } from "../types/LakeMethods.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { searchForLinemon } from "../utils/searchForLinemon.js";

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
		if (this.player.hasFishingRod()) {
			lakeOptions.unshift({
				name: `${chalk.blue("Fish")}`,
				value: "fish",
			});
		}

		console.log("\nYou are in the lake.");

		const answer = await createPrompt(
			"Where do you want to go?",
			lakeOptions
		);

		await delayMessage(null);
		switch (answer.selectedOption) {
			case "fish":
				searchForLinemon(
					linemonOptions,
					70,
					"water",
					this.player,
					this.goToLake
				);
				break;
			case "tallGrass":
				searchForLinemon(
					linemonOptions,
					100,
					"tallGrass",
					this.player,
					this.goToLake
				);
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
