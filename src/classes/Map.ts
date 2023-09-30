import type { CityProps } from "../interfaces/CityProps.js";
import type { GrasslandsProps } from "../interfaces/GrasslandsProps.js";
import type { ForestProps } from "../interfaces/ForestProps.js";
import type { LakeProps } from "../interfaces/LakeProps.js";

import { City } from "./City.js";
import { Grasslands } from "./Grasslands.js";
import { Forest } from "./Forest.js";
import { Lake } from "./Lake.js";

export class Map {
	private city: CityProps;
	private grasslands: GrasslandsProps;
	private forest: ForestProps;
	private lake: LakeProps;

	constructor() {
		this.city = new City("city", this.goToGrasslands);

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
