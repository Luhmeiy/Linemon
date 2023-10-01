import jsonCities from "../data/cities.json" assert { type: "json" };

import chalk from "chalk";

import type { CityProps } from "../interfaces/CityProps.js";
import type { ShopProps } from "../interfaces/ShopProps.js";
import type { Option } from "../types/Option.js";

import { addActionsToOptions } from "../utils/addActionsToOptions.js";
import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getActionConditions } from "../utils/getActionConditions.js";
import { getFromJson } from "../utils/getFromJson.js";
import { stringToTemplateLiteral } from "../utils/stringToTemplateLiteral.js";

import { Shop } from "./Shop.js";

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "Go back", value: "healingExit" },
];

export class City implements CityProps {
	selectedCity: CityProps;
	name: string;
	cityOptions: Option;
	shop: ShopProps;

	constructor(
		public id: CityProps["id"],
		public goToGrasslands: CityProps["goToGrasslands"],
		public player: CityProps["player"]
	) {
		this.selectedCity = getFromJson(jsonCities, id);

		this.name = this.selectedCity.name;

		this.cityOptions = stringToTemplateLiteral(
			this.selectedCity.cityOptions
		);
		this.cityOptions = addActionsToOptions(this.cityOptions);

		this.shop = new Shop(
			this.name,
			this.selectedCity.shopItemsIds!,
			this.goToCityCenter
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
			getActionConditions(answer, this.player, this.goToCityCenter);
		}
	};

	goToHealing = async () => {
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
