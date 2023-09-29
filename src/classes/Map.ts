import chalk from "chalk";

import { CityProps } from "../interfaces/CityProps.js";
import { GrasslandsProps } from "../interfaces/GrasslandsProps.js";
import { ForestProps } from "../interfaces/ForestProps.js";
import { LakeProps } from "../interfaces/LakeProps.js";

import { City } from "./City.js";
import { Grasslands } from "./Grasslands.js";
import { Forest } from "./Forest.js";
import { Lake } from "./Lake.js";

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
	private lake: LakeProps;

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
		this.lake = new Lake(this.goToGrasslands, this.goToForest);

		this.city.goToCityCenter();
	}

	// Directions
	goToCity = () => this.city.goToCityCenter();
	goToGrasslands = () => this.grasslands.goToGrasslands();
	goToForest = () => this.forest.goToForest();
	goToLake = () => this.lake.goToLake();
}
