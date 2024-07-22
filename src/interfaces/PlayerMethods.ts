import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";
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
	power?: number;
	evolvesType?: string;
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
	getInventory: (url: string) => void;
	getSpecialItems: () => InventoryItem[];
	addToInventory: (item: IShopItems, quantity: number) => void;
	removeFromInventory: (
		item: InventoryItem,
		inventory: InventoryItem[]
	) => void;
	getConsumables: (
		location: "battle" | "inventory",
		url: string,
		returnUrlParams?: ReturnUrlParams
	) => void;
	getDisks: (url: string, returnUrlParams: ReturnUrlParams) => void;
	hasFishingRod: () => boolean;
}

export interface PCMethods {
	getPC: (url: string) => void;
	addToPC: (linemon: LinemonProps) => void;
}

export interface TeamMethods {
	getTeam: (url: string) => void;
	getTeamRaw: () => LinemonProps[];
	getFirstTeam: () => LinemonProps;
	getLinemonById: (id: string) => LinemonProps;
	addToTeam: (linemon: LinemonProps) => void;
	cleanEffects: () => void;
}

export interface PlayerMethods {
	getName: () => string;
	getMoney: () => number;
	setMoney: (value: number) => void;

	setLinemonsSeen: (id: string) => void;
	setLinemonsCaught: (id: string) => void;

	getLinemonsSeen: () => string[];
	getLinemonsCaught: () => string[];

	getStatus: (url: string) => void;
}
