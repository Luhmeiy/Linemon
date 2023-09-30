import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { ShopProps } from "../interfaces/ShopProps.js";

import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";

import { Shop } from "./Shop.js";

export class City implements CityProps {
	shop: ShopProps;

	constructor(
		public name: CityProps["name"],
		public cityOptions: CityProps["cityOptions"],
		public healingOptions: CityProps["healingOptions"],
		public shopItemsIds: CityProps["shopItemsIds"],
		public goToGrasslands: CityProps["goToGrasslands"]
	) {
		this.shop = new Shop(this.name, this.shopItemsIds, this.goToCityCenter);
	}

	goToCityCenter = async () => {
		console.log(`\nYou are in ${this.name}.`);

		const answer = await createPrompt(
			"Where do you want to go?",
			this.cityOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "shop") {
			this.shop.goToShop();
		} else if (answer.selectedOption === "healingCenter") {
			this.goToHealing();
		} else if (answer.selectedOption === "grasslands") {
			this.goToGrasslands();
		}
	};

	goToHealing = async () => {
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
	};
}
