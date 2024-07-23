import type { IShopItems } from "@/interfaces/IShopItems.js";
import type {
	ConsumableItem,
	DiskItem,
	InventoryItem,
	InventoryMethods,
	InventoryType,
} from "@/interfaces/PlayerMethods.js";
import type { Option } from "@/types/Option.js";
import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";

import { player } from "@/routes/map/index.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";

const categoryOptions = [
	{ name: "Consumables", value: "consumable" },
	{ name: "Floppy Disks", value: "disk" },
	{ name: "Special Items", value: "special" },
	{ name: "Go back", value: "back" },
];

const itemOptions = [
	{ name: "Description", value: "description" },
	{ name: "Go back", value: "back" },
];

const extendedItemOptions = [
	{ name: "Use", value: "use" },
	{ name: "Quantity", value: "quantity" },
	...itemOptions,
];
const defaultOption = { name: "Go back", value: "back" };

export class Inventory implements InventoryMethods {
	inventory: InventoryType;

	constructor(inventory) {
		this.inventory = inventory
			? inventory.inventory
			: {
					consumable: [],
					disk: [],
					special: [],
			  };
	}

	// Basic functions
	getSpecialItems = () => this.inventory.special;
	addToInventory = (item: IShopItems, quantity: number) => {
		let inventory: InventoryItem[];
		let formattedItem = {
			id: item.id,
			name: item.name,
			description: item.description,
			quantity: quantity,
		};

		switch (item.category) {
			case "consumable":
				inventory = this.inventory.consumable;
				formattedItem = {
					...formattedItem,
					type: item.type,
					health: item.health && item.health,
					power: item.power && item.power,
					evolvesType: item.evolvesType && item.evolvesType,
				} as ConsumableItem;
				break;
			case "disk":
				inventory = this.inventory.disk;
				formattedItem = {
					...formattedItem,
					bonus: item.bonus,
				} as DiskItem;
				break;
			case "special":
				inventory = this.inventory.special;
				break;
		}

		const response = this.increaseQuantityIfItemExists(
			inventory,
			item.name,
			quantity
		);

		if (!response) inventory.push(formattedItem);
	};

	removeFromInventory = (item: InventoryItem, inventory: InventoryItem[]) => {
		item.quantity -= 1;

		if (item.quantity <= 0) {
			const index = inventory.findIndex(({ id }) => id === item.id);
			if (index !== -1) inventory.splice(index, 1);
		}
	};

	hasFishingRod = () => {
		return this.inventory.special.some(({ id }) => id === "fishingRod");
	};

	// Util functions
	private increaseQuantityIfItemExists = (
		inventory: InventoryItem[],
		itemName: string,
		quantity: number
	) => {
		for (const item of inventory) {
			if (item.name === itemName) {
				item.quantity += quantity;
				return true;
			}
		}
	};

	private selectDiskBonus = (disk: DiskItem, type: string) => {
		switch (disk.id) {
			case "disk":
			case "silverDisk":
			case "goldenDisk":
				return disk.bonus;
			default:
				// @ts-ignore
				return disk.bonus[type] || 1;
		}
	};

	private createOptions = (items: InventoryItem[]) => {
		return items.map(({ name, id }) => {
			return {
				name: name,
				value: id,
			};
		});
	};

	// Menu functions
	private itemDefaultVerification = async (
		items: object[],
		message: string,
		options: Option,
		returnFunction: () => void
	) => {
		if (items.length === 0) {
			await delayMessage("No items.\n");
			return await returnFunction();
		}

		const answer = await createPrompt(message, options);

		if (answer === "back") {
			console.log();
			return await returnFunction();
		}

		return answer;
	};

	private getLinemonsMenu = async () => {
		const team = player.team.getTeam();

		if (team.length === 0) {
			return await delayMessage(`No Linemons caught yet.\n`);
		}

		const options = team.map(
			({ info: { name }, status: { currentHp } }, i) => {
				const isFainted = currentHp === 0;

				return {
					name: `${name} ${isFainted ? "[fainted]" : ""}`,
					value: `${i}`,
				};
			}
		);

		const linemonAnswer = await createPrompt("Select Linemon to heal: ", [
			...options,
			{
				name: "Go back",
				value: "back",
			},
		]);

		if (linemonAnswer === "back") true;

		const linemonId = Number(linemonAnswer);
		return team[linemonId];
	};

	private getCategoryMenu = async (
		items: InventoryItem[],
		options: Option,
		url: string
	) => {
		const answer = await this.itemDefaultVerification(
			items,
			"Choose an item: ",
			options,
			() => this.getInventoryMenu(url)
		);

		if (!answer) return;

		for (const item of items) {
			if (answer === item.id) {
				const isItemSpecial = this.inventory.special.some(
					(e) => e.id === item.id
				);

				const newItemOptions = isItemSpecial
					? itemOptions
					: [{ name: "Quantity", value: "quantity" }, ...itemOptions];

				const response = await this.getItemMenu(item, newItemOptions);

				if (!response) this.getCategoryMenu(items, options, url);
			}
		}
	};

	private getItemMenu = async (item: any, options: Option) => {
		const itemAnswer = await createPrompt(item.name, options);

		switch (itemAnswer) {
			case "use":
				const playerLinemon = await this.getLinemonsMenu();

				if (typeof playerLinemon === "boolean" || !playerLinemon) {
					return this.getItemMenu(item, options);
				}

				switch (item.type) {
					case "potion": {
						let { currentHp, maxHp } = playerLinemon.status;

						if (currentHp === maxHp) {
							await delayMessage(
								`${playerLinemon.info.name} is at full health.\n`
							);

							return this.getItemMenu(item, options);
						}

						if (currentHp === 0) {
							await delayMessage(
								"You can't heal a fainted Linemon.\n"
							);

							return this.getItemMenu(item, options);
						}

						const health =
							currentHp + item.health! > maxHp
								? maxHp - currentHp
								: item.health;

						playerLinemon.status.currentHp += health;

						await delayMessage(
							`${playerLinemon.info.name} recovered ${health} HP.\n`
						);
						break;
					}
					case "elixir": {
						const { currentPp, maxPp } = playerLinemon.status;

						if (currentPp === maxPp) {
							await delayMessage(
								`${playerLinemon.info.name} has all PP.\n`
							);

							return this.getItemMenu(item, options);
						}

						const power =
							currentPp + item.power! > maxPp
								? maxPp - currentPp
								: item.power;

						playerLinemon.status.currentPp += power!;

						await delayMessage(
							`${playerLinemon.info.name} recovered ${power} PP.\n`
						);
						break;
					}
					case "revive": {
						let { currentHp, maxHp } = playerLinemon.status;

						if (currentHp !== 0) {
							await delayMessage(
								`You can't revive a Linemon that hasn't fainted.\n`
							);

							return this.getItemMenu(item, options);
						}

						const health = Math.floor(maxHp * item.health);

						playerLinemon.status.currentHp += health;

						await delayMessage(
							`${
								playerLinemon.info.name
							} was revived and recovered ${
								playerLinemon.status.currentHp === maxHp
									? "all"
									: health
							} HP.\n`
						);
						break;
					}
					case "stone": {
						if (!(playerLinemon.info.type === item.evolvesType)) {
							await delayMessage(
								`${item.name} can't be used in ${playerLinemon.info.type}-types.\n`
							);

							return this.getItemMenu(item, options);
						}

						await playerLinemon.evolve();
						break;
					}
				}

				this.removeFromInventory(item, this.inventory.consumable);
				return true;
			case "quantity":
				await delayMessage(`Quantity: ${item.quantity}\n`);
				return this.getItemMenu(item, options);
			case "description":
				await delayMessage(`${item.name}: ${item.description}\n`);
				return this.getItemMenu(item, options);
			default:
				return false;
		}
	};

	getInventoryMenu = async (url: string) => {
		const diskOptions: Option = [
			...this.createOptions(this.inventory.disk),
			defaultOption,
		];
		const specialOptions: Option = [
			...this.createOptions(this.inventory.special),
			defaultOption,
		];

		const answer = await createPrompt(
			"Select a category: ",
			categoryOptions
		);

		switch (answer) {
			case "consumable":
				await this.getConsumablesMenu("inventory", url);
				break;
			case "disk":
				await this.getCategoryMenu(
					this.inventory.disk,
					diskOptions,
					url
				);
				break;
			case "special":
				await this.getCategoryMenu(
					this.inventory.special,
					specialOptions,
					url
				);
				break;
			default:
				console.log();
				await getRoute(url);
				break;
		}
	};

	getConsumablesMenu = async (
		location: "battle" | "inventory",
		url: string,
		returnUrlParams?: ReturnUrlParams
	) => {
		const consumableOptions: Option = [
			...this.createOptions(this.inventory.consumable),
			defaultOption,
		];

		const returnFunction = () =>
			location === "battle"
				? getRoute(url, returnUrlParams)
				: this.getInventoryMenu(url);

		const answer = await this.itemDefaultVerification(
			this.inventory.consumable,
			"Choose a consumable: ",
			consumableOptions,
			returnFunction
		);

		if (!answer) return;

		for (const item of this.inventory.consumable) {
			if (answer === item.id) {
				const response = await this.getItemMenu(
					item,
					extendedItemOptions
				);

				if (response !== undefined) {
					if (location === "battle" && response) {
						return response;
					} else {
						return this.getConsumablesMenu(
							location,
							url,
							returnUrlParams
						);
					}
				}
			}
		}
	};

	getDisksMenu = async (url: string, returnUrlParams: ReturnUrlParams) => {
		const { wildLinemon } = returnUrlParams;

		const diskOptions: Option = [
			...this.createOptions(this.inventory.disk),
			defaultOption,
		];

		const answer = await this.itemDefaultVerification(
			this.inventory.disk,
			"Choose a floppy disk: ",
			diskOptions,
			() => getRoute(url, returnUrlParams)
		);

		if (!answer) return;

		for (const item of this.inventory.disk) {
			if (answer === item.id) {
				const itemAnswer = await createPrompt(
					item.name,
					extendedItemOptions
				);

				switch (itemAnswer) {
					case "use":
						const diskBonus = this.selectDiskBonus(
							item,
							wildLinemon.info.type
						);

						this.removeFromInventory(item, this.inventory.disk);
						return await getRoute("encounter", {
							...returnUrlParams,
							catchLinemon: true,
							diskBonus,
						});
					case "quantity":
						await delayMessage(`Quantity: ${item.quantity}`);
						break;
					case "description":
						await delayMessage(`${item.name}: ${item.description}`);
						break;
				}

				console.log();
				this.getDisksMenu(url, returnUrlParams);
			}
		}
	};
}
