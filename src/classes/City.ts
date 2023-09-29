import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";

export class City implements CityProps {
	constructor(
		public name: CityProps["name"],
		public cityOptions: CityProps["cityOptions"],
		public shopOptions: CityProps["shopOptions"],
		public healingOptions: CityProps["healingOptions"],
		public goToGrasslands: CityProps["goToGrasslands"]
	) {}

	async goToCityCenter() {
		console.log(`\nYou are in ${this.name}.`);

		const answer = await createPrompt(
			"Where do you want to go?",
			this.cityOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "shop") {
			this.goToShop();
		} else if (answer.selectedOption === "healingCenter") {
			this.goToHealing();
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		}
	}

	async goToShop() {
		console.log(`\nYou are in ${this.name}'s ${chalk.blue("shop")}.`);

		const answer = await createPrompt(
			"What do you want to buy?",
			this.shopOptions
		);

		if (answer.selectedOption === "shopExit") {
			await delayMessage("You left.");
			this.goToCityCenter();
		}
	}

	async goToHealing() {
		console.log(
			`\nYou are in ${this.name}'s ${chalk.red("healing center")}.`
		);

		const answer = await createPrompt(
			"Do you want to heal?",
			this.healingOptions
		);

		if (answer.selectedOption === "healingExit") {
			await delayMessage("You left.");
			this.goToCityCenter();
		} else if (answer.selectedOption === "heal") {
			await delayMessage("You healed.");
			this.goToHealing();
		}
	}
}
