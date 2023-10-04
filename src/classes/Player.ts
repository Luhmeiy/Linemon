import chalk from "chalk";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type {
	InventoryItem,
	InventoryMethods,
	PlayerMethods,
	TeamMethods,
} from "../interfaces/PlayerMethods.js";
import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";

import { delayMessage } from "../utils/delayMessage.js";

import { Inventory } from "./playerClasses/Inventory.js";
import { Team } from "./playerClasses/Team.js";

export class Player implements PlayerMethods {
	private money: number;
	private team: TeamMethods;
	private inventory: InventoryMethods;

	constructor(private name: string) {
		this.money = 1000;

		this.team = new Team();
		this.inventory = new Inventory();
	}

	// Player
	getName = () => this.name;
	getMoney = () => this.money;
	setMoney = (value: number) => (this.money += value);
	hasFishingRod = () => this.inventory.hasFishingRod();

	getStatus = async (returnFunction: () => void) => {
		await delayMessage(`${chalk.underline.bold(`${this.name}'s Status`)}
${chalk.bold("Money:")} ${this.money}\n`);

		returnFunction();
	};

	// Team
	getTeam = (returnFunction: () => void) => this.team.getTeam(returnFunction);

	addToTeam = async (linemon: WildLinemonProps) => {
		return await this.team.addToTeam(linemon);
	};

	// Inventory
	getInventory = (returnFunction: () => void) => {
		this.inventory.getInventory(returnFunction);
	};

	addToInventory = (item: IShopItems, quantity: number) => {
		this.inventory.addToInventory(item, quantity);
	};

	removeFromInventory = (item: InventoryItem, inventory: InventoryItem[]) => {
		this.inventory.removeFromInventory(item, inventory);
	};

	getDisks = (
		returnFunction: (linemon: WildLinemonProps) => void,
		linemon: WildLinemonProps
	) => {
		this.inventory.getDisks(returnFunction, linemon);
	};
}
