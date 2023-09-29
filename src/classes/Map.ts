import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { GrasslandsProps } from "../interfaces/GrasslandsProps.js";
import { ForestProps } from "../interfaces/ForestProps.js";

import { City } from "./City.js";
import { Grasslands } from "./Grasslands.js";
import { Forest } from "./Forest.js";

const cityOptions = [
	{ name: `Go to ${chalk.blue("shop")}`, value: "shop" },
	{ name: `Go to ${chalk.red("healing center")}`, value: "healingCenter" },
	{ name: `Go to ${chalk.green("grasslands")}`, value: "grasslands" },
];

const shopOptions = [{ name: "Go back", value: "shopExit" }];

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "Go back", value: "healingExit" },
];

export class Map {
	private city: CityProps;
	private grasslands: GrasslandsProps;
	private forest: ForestProps;

	constructor() {
		this.city = new City(
			"City",
			cityOptions,
			shopOptions,
			healingOptions,
			this.goToGrasslands
		);

		this.grasslands = new Grasslands(
			this.goToCity,
			this.goToForest,
			this.goToLake
		);

		this.forest = new Forest(this.goToGrasslands, this.goToLake);

		this.city.goToCityCenter();
	}

	// Directions
	goToCity = () => this.city.goToCityCenter();
	goToGrasslands = () => this.grasslands.goToGrasslands();
	goToForest = () => this.forest.goToForest();
	goToLake = () => console.log("You went to the lake");
}
