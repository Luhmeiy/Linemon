import jsonCities from "../data/cities.json" assert { type: "json" };

import chalk from "chalk";

import type { CityMethods, CityProps } from "../interfaces/CityProps.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";
import type { ShopMethods } from "../types/ShopMethods.js";
import type { Option } from "../types/Option.js";

import { addMenuToOptions } from "../utils/addMenuToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getMenu } from "../utils/getMenu.js";
import { getFromJson } from "../utils/getFromJson.js";
import { stringToTemplateLiteral } from "../utils/stringToTemplateLiteral.js";

import { Shop } from "./Shop.js";

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "Go back", value: "healingExit" },
];

export class City implements CityMethods {
	private selectedCity: CityProps;

	private name: string;
	private cityOptions: Option;

	private shop: ShopMethods;

	constructor(
		private id: string,
		private goToGrasslands: () => void,
		private player: PlayerMethods
	) {
		this.selectedCity = getFromJson(jsonCities, this.id);

		this.name = this.selectedCity.name;

		this.cityOptions = stringToTemplateLiteral(
			this.selectedCity.cityOptions
		);
		this.cityOptions = addMenuToOptions(this.cityOptions);

		this.shop = new Shop(
			this.name,
			this.selectedCity.shopItemsIds,
			this.goToCityCenter,
			this.player
		);
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
		} else {
			getMenu(this.player, this.goToCityCenter);
		}
	};

	private goToHealing = async () => {
		console.log(
			`\nYou are in ${this.name}'s ${chalk.red("healing center")}.`
		);

		const answer = await createPrompt(
			"Do you want to heal?",
			healingOptions
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
