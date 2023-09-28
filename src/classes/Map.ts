import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { City } from "./City.js";

const cityOptions = [
	{ name: `Go to ${chalk.blue("shop")}`, value: "city1" },
	{ name: `Go to ${chalk.red("healing center")}`, value: "city2" },
];

const shopOptions = [{ name: "Go back", value: "shopExit" }];

const healingOptions = [
	{ name: "Heal", value: "healing1" },
	{ name: "Go back", value: "healingExit" },
];

export class Map {
	city: CityProps;

	constructor() {
		this.city = new City("City", cityOptions, shopOptions, healingOptions);

		this.city.goToCity();
	}
}
