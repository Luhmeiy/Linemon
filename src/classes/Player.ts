import chalk from "chalk";
import type { IShopItems } from "../interfaces/IShopItems.js";
import type { InventoryItem, PlayerProps } from "../interfaces/PlayerProps.js";

import { delayMessage } from "../utils/delayMessage.js";

import { Inventory } from "./playerClasses/Inventory.js";

export class Player implements PlayerProps {
	private money: number;
	inventory: PlayerProps["inventory"];

	constructor(public name: string) {
		this.money = 1000;
		this.inventory = new Inventory();
	}

	getMoney = () => this.money;
	setMoney = (value: number) => (this.money += value);

	getStatus = async (returnFunction: () => void) => {
		await delayMessage(`${this.name}'s Status
${chalk.bold("Money:")} ${this.money}`);

		returnFunction();
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
}
