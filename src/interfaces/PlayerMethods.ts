import type { IShopItems } from "./IShopItems.js";
import type { WildLinemonProps } from "./WildLinemonProps.js";

export interface InventoryItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
}

export type InventoryType = {
	consumable: InventoryItem[];
	disk: InventoryItem[];
	special: InventoryItem[];
};

export interface InventoryMethods {
	getInventory: (returnFunction: () => void) => void;
	addToInventory: (item: IShopItems, quantity: number) => void;
	removeFromInventory: (
		item: InventoryItem,
		inventory: InventoryItem[]
	) => void;
	getDisks: (
		returnFunction: (linemon: WildLinemonProps) => void,
		linemon: WildLinemonProps
	) => void;
	hasFishingRod: () => boolean;
}

export interface TeamMethods {
	getTeam: (returnFunction: () => void) => void;
	addToTeam: (linemon: WildLinemonProps) => Promise<boolean>;
}

export interface PlayerMethods extends InventoryMethods, TeamMethods {
	getName: () => string;
	getMoney: () => number;
	setMoney: (value: number) => void;

	setLinemonsSeen: (id: string) => void;
	setLinemonsCaught: (id: string) => void;

	getStatus: (returnFunction: () => void) => void;
}
