import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { delayMessage } from "../utils/delayMessage.js";
import { createPrompt } from "../utils/createPrompt.js";

export class City implements CityProps {
	constructor(
		public name: CityProps["name"],
		public cityOptions: CityProps["cityOptions"],
		public shopOptions: CityProps["shopOptions"],
		public healingOptions: CityProps["healingOptions"]
	) {}

	async goToCity() {
		console.log(`\nYou are in ${this.name}.`);

		const answer = await createPrompt(
			"Where do you want to go?",
			this.cityOptions
		);

		if (answer.selectedOption === "city1") {
			await delayMessage(null);
			this.goToShop();
		} else if (answer.selectedOption === "city2") {
			await delayMessage(null);
			this.goToHealing();
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
			this.goToCity();
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
			this.goToCity();
		} else if (answer.selectedOption === "healing1") {
			await delayMessage("You healed.");
			this.goToHealing();
		}
	}
}
