import jsonCities from "../../data/cities.json" assert { type: "json" };

import chalk from "chalk";

import type { CityProps } from "../../interfaces/CityProps.js";
import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";
import type { Option } from "../../types/Option.js";

import { Shop } from "./Shop.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { getFromJson } from "../../utils/getFromJson.js";
import { stringToTemplateLiteral } from "../../utils/stringToTemplateLiteral.js";

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "PC", value: "pc" },
	{ name: "Go back", value: "healingExit" },
];

export class City {
	private selectedCity: CityProps;

	private name: string;
	private cityOptions: Option;

	private shop: Shop;

	constructor(
		private id: string,
		private player: PlayerMethods,
		private goToPlace:
			| (() => void)
			| ((direction: "top" | "bottom") => Promise<void>)
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
				// @ts-ignore
				this.goToPlace();
				break;
			case "lake":
				// @ts-ignore
				this.goToPlace();
				break;
			case "mountain":
				await this.goToPlace("top");
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
			"What do you want to do?",
			healingOptions
		);

		switch (answer.selectedOption) {
			case "heal":
				const team = this.player.getTeamRaw();

				for (const linemon of team) {
					linemon.status.currentHp = linemon.status.maxHp;
					linemon.status.currentPp = linemon.status.maxPp;
				}

				await delayMessage("Your Linemons are healed.");
				this.goToHealing();
				break;
			case "pc":
				return this.player.getPC(this.goToHealing);
			default:
				await delayMessage("You left.");
				return this.goToCityCenter();
		}
	};
}
