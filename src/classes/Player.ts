import chalk from "chalk";

import type {
	InventoryMethods,
	PCMethods,
	PlayerMethods,
	TeamMethods,
} from "../interfaces/PlayerMethods.js";

import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";

import { Inventory } from "./playerClasses/Inventory.js";
import { PC } from "./playerClasses/PC.js";
import { Team } from "./playerClasses/Team.js";

interface PlayerLocation {
	type: string;
	location: string;
	lastVisitedCityId: string;
	lastVisitedCityName: string;
}

export class Player implements PlayerMethods {
	private name: string;
	private money: number;
	private linemonsSeen: string[];
	private linemonsCaught: string[];
	public playerLocation: PlayerLocation;

	team: TeamMethods;
	pc: PCMethods;
	inventory: InventoryMethods;

	constructor(player: string | Player) {
		this.name = player.name || player;
		this.money = player.money || 1000;
		this.linemonsSeen = player.linemonsSeen || [];
		this.linemonsCaught = player.linemonsCaught || [];
		this.playerLocation = player.playerLocation || {
			type: "city",
			location: "city",
			lastVisitedCityId: "city",
			lastVisitedCityName: "City",
		};

		this.team = new Team(player.team);
		this.pc = new PC(player.pc);
		this.inventory = new Inventory(player.inventory);
	}

	// Information
	getName = () => this.name;
	getMoney = () => this.money;
	setMoney = (value: number) => (this.money += value);
	getStatus = async (url: string) => {
		await delayMessage(`${chalk.underline.bold(`${this.name}'s Status`)}
${chalk.bold("Money:")} ${this.money}
${chalk.bold("Linemon seen:")} ${this.linemonsSeen.length}
${chalk.bold("Linemon caught:")} ${this.linemonsCaught.length}\n`);

		await getRoute(url);
	};

	getPlayerLocation = () => {
		const { type, location } = this.playerLocation;
		return `${type}/${location}`;
	};

	setPlayerLocation = (type: string, location: string, name?: string) => {
		this.playerLocation = {
			type,
			location,
			lastVisitedCityId:
				type === "city"
					? location
					: this.playerLocation.lastVisitedCityId,
			lastVisitedCityName:
				type === "city"
					? name
					: this.playerLocation.lastVisitedCityName,
		};
	};

	// Linemon
	setLinemonsSeen = (id: string) => {
		if (!this.linemonsSeen.some((linemonId) => linemonId === id)) {
			this.linemonsSeen.push(id);
		}
	};
	setLinemonsCaught = (id: string) => {
		if (!this.linemonsCaught.some((linemonId) => linemonId === id)) {
			this.linemonsCaught.push(id);
		}
	};

	getLinemonsSeen = () => this.linemonsSeen;
	getLinemonsCaught = () => this.linemonsCaught;
}
