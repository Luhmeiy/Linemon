import chalk from "chalk";

import type { GrasslandsProps } from "../interfaces/GrasslandsProps.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { goToTallGrass } from "../utils/goToTallGrass.js";

const grasslandsOptions = [
	{ name: `Go to ${chalk.green("tall grass")}`, value: "tallGrass" },
	{ name: "Go to city", value: "city" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
	{ name: `Go to ${chalk.blue("lake")}`, value: "lake" },
];

export class Grasslands implements GrasslandsProps {
	constructor(
		public goToCity: GrasslandsProps["goToCity"],
		public goToForest: GrasslandsProps["goToForest"],
		public goToLake: GrasslandsProps["goToLake"]
	) {}

	goToGrasslands = async () => {
		console.log("\nYou are in the grasslands.");

		const answer = await createPrompt(
			"Where do you want to go?",
			grasslandsOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "tallGrass") {
			goToTallGrass(this.goToGrasslands);
		} else if (answer.selectedOption === "city") {
			this.goToCity();
		} else if (answer.selectedOption === "forest") {
			this.goToForest();
		} else if (answer.selectedOption === "lake") {
			this.goToLake();
		}
	};
}
