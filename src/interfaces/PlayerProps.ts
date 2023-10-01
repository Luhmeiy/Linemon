import type { IShopItems } from "./IShopItems.js";

export interface InventoryItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
}

interface InventoryMethods {
	getInventory: (returnFunction: () => void) => void;
	addToInventory: (item: IShopItems, quantity: number) => void;
	removeFromInventory: (
		item: InventoryItem,
		inventory: InventoryItem[]
	) => void;
}

export interface InventoryProps extends InventoryMethods {
	inventory: {
		consumable: InventoryItem[];
		disk: InventoryItem[];
		special: InventoryItem[];
	};
}

export interface PlayerProps extends InventoryMethods {
	name: string;
	inventory: InventoryProps;

	getMoney: () => number;
	setMoney: (value: number) => void;
}
