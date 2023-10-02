import chalk from "chalk";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type {
	InventoryItem,
	InventoryProps,
	PlayerProps,
	TeamMethods,
} from "../interfaces/PlayerProps.js";
import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";

import { delayMessage } from "../utils/delayMessage.js";

import { Inventory } from "./playerClasses/Inventory.js";
import { Team } from "./playerClasses/Team.js";

export class Player implements PlayerProps {
	private money: number;
	private team: TeamMethods;
	private inventory: InventoryProps;

	constructor(public name: string) {
		this.money = 1000;

		this.team = new Team();
		this.inventory = new Inventory();
	}

	getMoney = () => this.money;
	setMoney = (value: number) => (this.money += value);

	getStatus = async (returnFunction: () => void) => {
		await delayMessage(`${this.name}'s Status
${chalk.bold("Money:")} ${this.money}`);

		returnFunction();
	};

	getTeam = (returnFunction: () => void) => this.team.getTeam(returnFunction);

	addToTeam = async (linemon: WildLinemonProps) => {
		await this.team.addToTeam(linemon);
		return true;
	};

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
