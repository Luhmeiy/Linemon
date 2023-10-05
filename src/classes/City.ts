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
	{ name: "PC", value: "pc" },
	{ name: "Go back", value: "healingExit" },
];

export class City implements CityMethods {
	private selectedCity: CityProps;

	private name: string;
	private cityOptions: Option;

	private shop: ShopMethods;

	constructor(
		private id: string,
		private player: PlayerMethods,
		private goToPlace: () => void
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
		switch (answer.selectedOption) {
			case "shop":
				this.shop.goToShop();
				break;
			case "healingCenter":
				this.goToHealing();
				break;
			case "grasslands":
				this.goToPlace();
				break;
			case "lake":
				this.goToPlace();
				break;
			default:
				getMenu(this.player, this.goToCityCenter);
				break;
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

		switch (answer.selectedOption) {
			case "heal":
				await delayMessage("You healed.");
				this.goToHealing();
				break;
			case "pc":
				this.player.getPC(this.goToHealing);
				break;
			default:
				await delayMessage("You left.");
				this.goToCityCenter();
				break;
		}
	};
}
