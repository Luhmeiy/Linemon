import type { CityMethods } from "../interfaces/CityProps.js";
import type { ForestMethods } from "../types/ForestMethods.js";
import type { GrasslandsMethods } from "../types/GrasslandsMethods.js";
import type { LakeMethods } from "../types/LakeMethods.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";

import { City } from "./City.js";
import { Forest } from "./Forest.js";
import { Grasslands } from "./Grasslands.js";
import { Lake } from "./Lake.js";
import { Player } from "./Player.js";

export class Map {
	private player: PlayerMethods;

	private city: CityMethods;
	private lakeCity: CityMethods;

	private forest: ForestMethods;
	private grasslands: GrasslandsMethods;
	private lake: LakeMethods;

	constructor(name: string) {
		this.player = new Player(name);

		this.city = new City("city", this.player, this.goToGrasslands);
		this.lakeCity = new City("lakeCity", this.player, this.goToLake);

		this.grasslands = new Grasslands(
			this.goToCity,
			this.goToForest,
			this.goToLake,
			this.player
		);

		this.forest = new Forest(
			this.goToGrasslands,
			this.goToLake,
			this.player
		);
		this.lake = new Lake(
			this.goToGrasslands,
			this.goToLakeCity,
			this.goToForest,
			this.player
		);

		this.city.goToCityCenter();
	}

	// Directions
	goToCity = () => this.city.goToCityCenter();
	goToLakeCity = () => this.lakeCity.goToCityCenter();
	goToGrasslands = () => this.grasslands.goToGrasslands();
	goToForest = () => this.forest.goToForest();
	goToLake = () => this.lake.goToLake();
}
