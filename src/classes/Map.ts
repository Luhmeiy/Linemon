import { City } from "./City.js";
import { Forest } from "./Forest.js";
import { Grasslands } from "./Grasslands.js";
import { Lake } from "./Lake.js";
import { Player } from "./Player.js";

export class Map {
	private player: Player;

	private city: City;
	private lakeCity: City;

	private forest: Forest;
	private grasslands: Grasslands;
	private lake: Lake;

	constructor(name: string) {
		this.player = new Player(name);

		this.city = new City("city", this.player, this.goToGrasslands);
		this.lakeCity = new City("lakeCity", this.player, this.goToLake);

		this.forest = new Forest(
			this.goToGrasslands,
			this.goToLake,
			this.player
		);

		this.grasslands = new Grasslands(
			this.goToCity,
			this.goToForest,
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

	goToForest = () => this.forest.goToForest();
	goToGrasslands = () => this.grasslands.goToGrasslands();
	goToLake = () => this.lake.goToLake();
}
