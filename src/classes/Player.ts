import chalk from "chalk";

import type { IShopItems } from "@/interfaces/IShopItems.js";
import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type {
	InventoryItem,
	InventoryMethods,
	PCMethods,
	PlayerMethods,
	TeamMethods,
} from "../interfaces/PlayerMethods.js";
import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";

import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";

import { Inventory } from "./playerClasses/Inventory.js";
import { PC } from "./playerClasses/PC.js";
import { Team } from "./playerClasses/Team.js";

export class Player implements PlayerMethods {
	private name: string;
	private money: number;
	private linemonsSeen: string[];
	private linemonsCaught: string[];

	team: TeamMethods;
	private pc: PCMethods;
	private inventory: InventoryMethods;

	constructor(player: string | Player) {
		if (typeof player === "string") {
			this.name = player;
			this.money = 1000;
			this.linemonsSeen = [];
			this.linemonsCaught = [];

			this.team = new Team(this.addToPC);
			this.pc = new PC(this.addToTeam);
			this.inventory = new Inventory();
		} else {
			this.name = player.name;
			this.money = player.money;
			this.linemonsSeen = player.linemonsSeen;
			this.linemonsCaught = player.linemonsCaught;

			//@ts-ignore
			this.team = new Team(this.addToPC, player.team.team);
			//@ts-ignore
			this.pc = new PC(this.addToTeam, player.pc.pc);
			//@ts-ignore
			this.inventory = new Inventory(player.inventory.inventory);
		}
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

	getLinemonsSeen = () => this.linemonsSeen;
	getLinemonsCaught = () => this.linemonsCaught;

	hasFishingRod = () => this.inventory.hasFishingRod();

	getStatus = async (url: string) => {
		await delayMessage(`${chalk.underline.bold(`${this.name}'s Status`)}
${chalk.bold("Money:")} ${this.money}
${chalk.bold("Linemon seen:")} ${this.linemonsSeen.length}
${chalk.bold("Linemon caught:")} ${this.linemonsCaught.length}\n`);

		await getRoute(url);
	};

	// Team
	getTeam = (url: string) => this.team.getTeam(url);
	getTeamRaw = () => this.team.getTeamRaw();
	getFirstTeam = () => this.team.getFirstTeam();
	getLinemonById = (id: string) => this.team.getLinemonById(id);

	addToTeam = async (linemon: LinemonProps) => {
		const linemonForPC = await this.team.addToTeam(linemon);

		if (linemonForPC) await this.addToPC(linemonForPC);
		return undefined;
	};

	// PC
	getPC = (url: string) => this.pc.getPC(url);
	addToPC = async (linemon: LinemonProps) => await this.pc.addToPC(linemon);

	// Inventory
	getInventory = async (url: string) => {
		const team = await this.team.getTeamRaw();
		this.inventory.getInventory(url, team);
	};

	getSpecialItems = () => this.inventory.getSpecialItems();

	addToInventory = (item: IShopItems, quantity: number) => {
		this.inventory.addToInventory(item, quantity);
	};

	removeFromInventory = (item: InventoryItem, inventory: InventoryItem[]) => {
		this.inventory.removeFromInventory(item, inventory);
	};

	getConsumables = async (
		url: string,
		team: LinemonProps[],
		location: "battle" | "inventory",
		returnUrlParams: ReturnUrlParams
	) => {
		return await this.inventory.getConsumables(
			url,
			team,
			location,
			returnUrlParams
		);
	};

	getDisks = (url: string, returnUrlParams: ReturnUrlParams) => {
		this.inventory.getDisks(url, returnUrlParams);
	};
}
