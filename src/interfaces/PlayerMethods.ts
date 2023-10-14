import type { IShopItems } from "./IShopItems.js";
import type { LinemonProps } from "./LinemonProps.js";

export interface InventoryItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
}

export interface ConsumableItem extends InventoryItem {
	type: string;
	health?: number;
}

export interface DiskItem extends InventoryItem {
	bonus:
		| number
		| {
				[type: string]: number;
		  };
}

export type InventoryType = {
	consumable: ConsumableItem[];
	disk: DiskItem[];
	special: InventoryItem[];
};

export interface InventoryMethods {
	getInventory: (returnFunction: () => void, team: LinemonProps[]) => void;
	addToInventory: (item: IShopItems, quantity: number) => void;
	removeFromInventory: (
		item: InventoryItem,
		inventory: InventoryItem[]
	) => void;
	getConsumables: (
		returnFunction: (linemon?: LinemonProps) => void,
		team: LinemonProps[],
		linemon?: LinemonProps
	) => void;
	getDisks: (
		returnFunction: (linemon: LinemonProps) => void,
		linemon: LinemonProps
	) => void;
	hasFishingRod: () => boolean;
}

export interface PCMethods {
	getPC: (returnFunction: () => void) => void;
	addToPC: (linemon: LinemonProps) => void;
}

export interface TeamMethods {
	getTeam: (returnFunction: () => void) => void;
	getTeamRaw: () => LinemonProps[];
	getFirstTeam: () => LinemonProps;
	addToTeam: (linemon: LinemonProps) => Promise<LinemonProps | undefined>;
}

export interface PlayerMethods
	extends InventoryMethods,
		TeamMethods,
		PCMethods {
	getName: () => string;
	getMoney: () => number;
	setMoney: (value: number) => void;

	setLinemonsSeen: (id: string) => void;
	setLinemonsCaught: (id: string) => void;

	getStatus: (returnFunction: () => void) => void;

	getInventory: (returnFunction: () => void) => void;
}
