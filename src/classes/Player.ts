import chalk from "chalk";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type {
	InventoryItem,
	InventoryMethods,
	PCMethods,
	PlayerMethods,
	TeamMethods,
} from "../interfaces/PlayerMethods.js";
import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";
import type { LinemonProps } from "../interfaces/LinemonProps.js";

import { delayMessage } from "../utils/delayMessage.js";

import { Inventory } from "./playerClasses/Inventory.js";
import { PC } from "./playerClasses/PC.js";
import { Team } from "./playerClasses/Team.js";

export class Player implements PlayerMethods {
	private money: number;
	private linemonsSeen: string[];
	private linemonsCaught: string[];

	private team: TeamMethods;
	private pc: PCMethods;
	private inventory: InventoryMethods;

	constructor(private name: string) {
		this.money = 1000;
		this.linemonsSeen = [];
		this.linemonsCaught = [];

		this.team = new Team();
		this.pc = new PC();
		this.inventory = new Inventory();
	}

	// Player
	getName = () => this.name;
	getMoney = () => this.money;
	setMoney = (value: number) => (this.money += value);

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

	hasFishingRod = () => this.inventory.hasFishingRod();

	getStatus = async (returnFunction: () => void) => {
		await delayMessage(`${chalk.underline.bold(`${this.name}'s Status`)}
${chalk.bold("Money:")} ${this.money}
${chalk.bold("Linemon seen:")} ${this.linemonsSeen.length}
${chalk.bold("Linemon caught:")} ${this.linemonsCaught.length}\n`);

		returnFunction();
	};

	// Team
	getTeam = (returnFunction: () => void) => this.team.getTeam(returnFunction);

	addToTeam = async (linemon: WildLinemonProps) => {
		const linemonForPC = await this.team.addToTeam(linemon);

		if (linemonForPC) await this.addToPC(linemonForPC);
		return undefined;
	};

	// PC
	getPC = (returnFunction: () => void) => this.pc.getPC(returnFunction);
	addToPC = async (linemon: LinemonProps) => await this.pc.addToPC(linemon);

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
