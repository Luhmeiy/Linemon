import type { IShopItems } from "../interfaces/IShopItems.js";
import type { InventoryItem, PlayerProps } from "../interfaces/PlayerProps.js";

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
