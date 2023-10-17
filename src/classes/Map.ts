import { Cave } from "./mapClasses/Cave.js";
import { City } from "./mapClasses/City.js";
import { Desert } from "./mapClasses/Desert.js";
import { Forest } from "./mapClasses/Forest.js";
import { Grasslands } from "./mapClasses/Grasslands.js";
import { Lake } from "./mapClasses/Lake.js";
import { MountainPeak } from "./mapClasses/MountainPeak.js";
import { Player } from "./Player.js";

import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";

export class Map {
	private player: Player;

	private city: City;
	private lakeCity: City;
	private mountainCity: City;

	private cave: Cave;
	private desert: Desert;
	private forest: Forest;
	private grasslands: Grasslands;
	private lake: Lake;
	private mountainPeak: MountainPeak;

	constructor(name: string) {
		this.player = new Player(name);

		this.city = new City("city", this.player, this.goToGrasslands);
		this.lakeCity = new City("lakeCity", this.player, this.goToLake);
		this.mountainCity = new City(
			"mountainCity",
			this.player,
			this.goToMountainPeak,
			this.goToMountain
		);

		this.cave = new Cave(
			this.goToMountainCity,
			this.goToDesert,
			this.goToForest,
			this.player
		);

		this.desert = new Desert(this.goToMountain, this.player);

		this.forest = new Forest(
			this.goToGrasslands,
			this.goToMountain,
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

		this.mountainPeak = new MountainPeak(
			this.goToMountainCity,
			this.player
		);

		this.city.goToCityCenter();
	}

	// Directions
	goToCity = () => this.city.goToCityCenter();
	goToLakeCity = () => this.lakeCity.goToCityCenter();
	goToMountainCity = () => this.mountainCity.goToCityCenter();

	goToMountain = async (direction: "top" | "bottom") => {
		switch (direction) {
			case "bottom":
				await delayMessage(
					"To get to the mountain you first need to go through a cave.\n"
				);

				const { selectedOption } = await createPrompt(
					"Do you want to go inside the cave?",
					[
						{ name: "Yes", value: "yes" },
						{ name: "No", value: "no" },
					]
				);

				switch (selectedOption) {
					case "yes":
						return this.cave.goToCave();
					default:
						return this.goToForest();
				}
			case "top":
				return this.cave.goToCave();
		}
	};

	goToDesert = () => this.desert.goToDesert();
	goToForest = () => this.forest.goToForest();
	goToGrasslands = () => this.grasslands.goToGrasslands();
	goToLake = () => this.lake.goToLake();
	goToMountainPeak = () => this.mountainPeak.goToMountainPeak();
}
