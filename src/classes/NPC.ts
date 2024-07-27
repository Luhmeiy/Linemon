import jsonShopItems from "@/data/shopItems.json";

import chalk from "chalk";
import gradient from "gradient-string";

import { LinemonProps } from "@/interfaces/LinemonProps.js";
import { NPCMethods } from "@/interfaces/NPCMethods.js";

import { Linemon } from "./Linemon.js";
import { player } from "@/routes/map/index.js";
import { attack } from "@/utils/attack.js";
import {
	filterLinemons,
	formatType,
	verifyIfAffected,
} from "@/utils/combatUtils.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getCombatMenu } from "@/utils/getCombatMenu.js";
import { getFromJson } from "@/utils/getFromJson.js";
import { getRoute } from "@/utils/getRoute.js";
import { randomIntFromInterval } from "@/utils/randomIntFromInterval.js";
import {
	formatItem,
	getFullShopItems,
	getItemMenu,
} from "@/utils/shopUtils.js";
import { Option } from "@/types/Option.js";
import { IShopItems } from "@/interfaces/IShopItems.js";

interface DialogContent {
	[text: string]: string;
}

interface Dialog {
	[key: string]: DialogContent & {
		options: Option;
	};
}

export class NPC implements NPCMethods {
	public id: string;
	public name: string;
	public dialog: Dialog;
	public itemIds: string[];
	public gift: IShopItems | undefined;
	public giftId: string;
	public giftQuantity: number;
	public team: Linemon[];

	constructor(data: NPC) {
		this.id = data.id;
		this.name = data.name;
		this.dialog = data.dialog;
		this.itemIds = data.itemIds || [];
		this.team = data.team
			? data.team.map((linemon) => new Linemon(linemon))
			: [];
		this.gift = getFromJson(jsonShopItems, data.giftId) || [];
		this.giftQuantity = data.giftQuantity;
	}

	private healTeam = () => {
		for (const linemon of this.team) {
			linemon.status.currentHp = linemon.status.maxHp;
			linemon.status.currentPp = linemon.status.maxPp;
		}
	};

	getFirstTeam = () => {
		for (const linemon of this.team) {
			if (linemon.status.currentHp > 0) {
				return linemon;
			}
		}
	};

	getFight = async (
		url: string,
		params?: {
			activePlayerLinemonId?: string;
			battleStart?: boolean;
			battleWon?: boolean;
			verifyEffect?: boolean;
		}
	) => {
		let linemon: LinemonProps;
		const npcLinemon = this.getFirstTeam();

		if (params.battleWon && this.getFirstTeam() === undefined) {
			await delayMessage(this.dialog["fight"].playerWinText);
			return await getRoute(`npc/${this.id}`, { url });
		}

		if (params.battleWon || params.battleStart) {
			console.log(`\n${this.name} sent out ${npcLinemon.info.name}\n`);
			await delayMessage(null);
		}

		// Select first Linemon in the beginning of battle
		if (params.battleStart) {
			linemon = player.team.getFirstTeam();
		}

		// Get Linemon by id if id is set
		if (params.activePlayerLinemonId) {
			linemon = player.team.getLinemonById(params.activePlayerLinemonId);
		}

		// Prompt player to select a Linemon
		if (!params.battleStart && !params.activePlayerLinemonId) {
			const availableLinemons = filterLinemons();

			if (availableLinemons.length === 0) {
				this.healTeam();

				await delayMessage("All your Linemons fainted.");
				await delayMessage(
					`You took them to a ${chalk.red("healing center")}.`
				);
				return getRoute(`map/heal`, {
					cityId: player.playerLocation.lastVisitedCityId,
					cityName: player.playerLocation.lastVisitedCityName,
					defeatedTeam: true,
				});
			}

			const linemonId = await createPrompt("Choose a Linemon: ", [
				...availableLinemons,
			]);

			linemon = player.team.getLinemonById(linemonId);
		}

		if (params.verifyEffect) {
			await verifyIfAffected(npcLinemon);
			await verifyIfAffected(linemon);
		}

		if (!params.activePlayerLinemonId) {
			console.log(`You sent out ${linemon.info.name}\n`);
			await delayMessage(null);
		}

		// Format Linemon type and display wild Linemon informations
		const type = formatType(npcLinemon!.info.type);
		console.log(`${npcLinemon.info.name} - Lvl. ${npcLinemon.info.lvl} ${
			npcLinemon.info.isShiny === true ? gradient.cristal("[Shiny]") : ""
		}
HP: (${npcLinemon.status.currentHp}/${npcLinemon.status.maxHp})
Type: ${type}`);

		const linemonActions = [
			{ name: `${linemon.info.name}'s status`, value: "status" },
			{ name: "Fight", value: "fight" },
			{ name: "Swap", value: "swap" },
			{ name: "Inventory", value: "inventory" },
			{ name: "Run", value: "run" },
		];

		const answer = await createPrompt(
			"What do you want to do?",
			linemonActions
		);

		const returnParams = {
			activePlayerLinemonId: linemon.referenceId,
		};

		switch (answer) {
			case "status":
				await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
PP: (${linemon.status.currentPp}/${linemon.status.maxPp})\n`);
				return this.getFight(url, returnParams);
			case "fight":
				return getCombatMenu(
					(newParams) =>
						this.getFight(url, {
							...returnParams,
							...newParams,
						}),
					npcLinemon,
					linemon
				);
			case "swap":
				const availableLinemons = filterLinemons(linemon);

				if (availableLinemons.length === 0) {
					await delayMessage("No Linemons available.\n");
					return await this.getFight(url, returnParams);
				}

				const linemonId = await createPrompt(
					"Choose a Linemon to swap: ",
					[...availableLinemons, { name: "Go back", value: "back" }]
				);

				if (linemonId === "back") {
					console.log();
					await this.getFight(url, returnParams);
				}

				const selectedLinemon = player.team.getLinemonById(linemonId);

				await delayMessage(
					`Swapped ${linemon.info.name} and ${selectedLinemon.info.name}.\n`
				);

				const selectedMove =
					npcLinemon.moves[randomIntFromInterval(0, 3)];
				await attack(
					(newParams) =>
						this.getFight(url, {
							...returnParams,
							...newParams,
						}),
					selectedMove,
					npcLinemon,
					selectedLinemon
				);

				return await this.getFight(url, {
					...returnParams,
					activePlayerLinemonId: selectedLinemon.referenceId,
					verifyEffect: true,
				});
			case "inventory":
				const response = await player.inventory.getConsumablesMenu(
					"battle",
					() => this.getFight(url, returnParams)
				);

				// @ts-ignore
				if (response!) {
					const selectedMove =
						npcLinemon.moves[randomIntFromInterval(0, 3)];
					await attack(
						(newParams) =>
							this.getFight(url, {
								...returnParams,
								...newParams,
							}),
						selectedMove,
						npcLinemon,
						linemon
					);

					return this.getFight(url, {
						...returnParams,
						verifyEffect: true,
					});
				}
				break;
			default:
				await delayMessage("You ran away.\n");
				return await getRoute(`npc/${this.id}`, { url });
		}
	};

	getShop = async (url: string) => {
		const shopItems = getFullShopItems(this.itemIds);

		const shopOptions = shopItems.map(({ name, price, id }) => {
			return {
				name: formatItem(name, price),
				value: id,
			};
		});
		shopOptions.push({ name: "Go back", value: "back" });

		const answer = await createPrompt(
			this.dialog["shop"].text,
			shopOptions
		);

		if (answer === "back") await getRoute(`npc/${this.id}`, { url });

		for (const item of shopItems) {
			if (answer === item.id)
				await getItemMenu(
					item,
					() => getRoute(`npc/${this.id}`, { url }),
					() => this.getShop(url)
				);
		}
	};
}
