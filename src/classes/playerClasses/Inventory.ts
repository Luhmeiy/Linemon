import type { IShopItems } from "../../interfaces/IShopItems.js";
import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type {
	ConsumableItem,
	DiskItem,
	InventoryItem,
	InventoryMethods,
	InventoryType,
} from "../../interfaces/PlayerMethods.js";
import type { Option } from "../../types/Option.js";

import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";

const categoryOptions = [
	{ name: "Consumables", value: "consumable" },
	{ name: "Floppy Disks", value: "disk" },
	{ name: "Special Items", value: "special" },
	{ name: "Go back", value: "back" },
];

const itemOptions = [
	{ name: "Quantity", value: "quantity" },
	{ name: "Description", value: "description" },
	{ name: "Go back", value: "back" },
];

const extendedItemOptions = [{ name: "Use", value: "use" }, ...itemOptions];
const defaultOption = { name: "Go back", value: "back" };

export class Inventory implements InventoryMethods {
	inventory: InventoryType;

	constructor(inventory?: InventoryType) {
		this.inventory = inventory || {
			consumable: [],
			disk: [],
			special: [],
		};
	}

	getInventory = async (returnFunction: () => void, team: LinemonProps[]) => {
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

		switch (answer.selectedOption) {
			case "consumable":
				const newReturnFunction = () =>
					this.getInventory(returnFunction, team);
				await this.getConsumables(newReturnFunction, team, "inventory");
				break;
			case "disk":
				await this.createItemMenus(
					this.inventory.disk,
					diskOptions,
					returnFunction,
					team
				);
				break;
			case "special":
				await this.createItemMenus(
					this.inventory.special,
					specialOptions,
					returnFunction,
					team
				);
				break;
			default:
				console.log();
				returnFunction();
				break;
		}
	};

	addToInventory = (item: IShopItems, quantity: number) => {
		let inventory;
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

	removeFromInventory = (item: InventoryItem, inventory: InventoryItem[]) => {
		item.quantity -= 1;

		if (item.quantity <= 0) {
			const index = inventory.findIndex((i) => i.id === item.id);
			if (index !== -1) inventory.splice(index, 1);
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
		return items.map((item) => {
			return {
				name: item.name,
				value: item.id,
			};
		});
	};

	private itemDefaultVerification = async (
		items: object[],
		message: string,
		options: Option,
		returnFunction: () => void
	) => {
		if (items.length === 0) {
			await delayMessage("No items.\n");
			return returnFunction();
		}

		const answer = await createPrompt(message, options);

		if (answer.selectedOption === "back") {
			console.log();
			return returnFunction();
		}

		return answer;
	};

	private createLinemonsMenu = async (team: LinemonProps[]) => {
		const options = team.map((linemon, i) => {
			return {
				name: linemon.info.name,
				value: `${i}`,
			};
		});
		options.push({
			name: "Go back",
			value: "back",
		});

		const linemonAnswer = await createPrompt(
			"Select Linemon to heal: ",
			options
		);

		if (linemonAnswer.selectedOption === "back") {
			return true;
		}

		const linemonId = Number(linemonAnswer.selectedOption);
		return team[linemonId];
	};

	private getItemMenu = async (
		item: ConsumableItem,
		team: LinemonProps[]
	): Promise<any> => {
		const itemAnswer = await createPrompt(item.name, extendedItemOptions);

		switch (itemAnswer.selectedOption) {
			case "use":
				const playerLinemon = await this.createLinemonsMenu(team);

				if (typeof playerLinemon === "boolean") {
					return this.getItemMenu(item, team);
				}

				switch (item.type) {
					case "potion":
						const currentHp = playerLinemon.status.currentHp;
						const maxHp = playerLinemon.status.maxHp;

						if (currentHp === maxHp) {
							await delayMessage(
								`${playerLinemon.info.name} is at full health.\n`
							);

							return this.getItemMenu(item, team);
						}

						const health =
							currentHp + item.health! > maxHp
								? maxHp - currentHp
								: item.health;

						playerLinemon.status.currentHp += health!;

						await delayMessage(
							`${playerLinemon.info.name} recovered ${health} HP.\n`
						);
						break;
					case "elixir":
						const currentPp = playerLinemon.status.currentPp;
						const maxPp = playerLinemon.status.maxPp;

						if (currentPp === maxPp) {
							await delayMessage(
								`${playerLinemon.info.name} has all PP.\n`
							);

							return this.getItemMenu(item, team);
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
					case "stone":
						if (!(playerLinemon.info.type === item.evolvesType)) {
							await delayMessage(
								`${item.name} can't be used in ${playerLinemon.info.type}-types.\n`
							);

							return this.getItemMenu(item, team);
						}

						await playerLinemon.evolve();
						break;
				}

				this.removeFromInventory(item, this.inventory.consumable);
				return true;
			case "quantity":
				await delayMessage(`Quantity: ${item.quantity}\n`);
				return this.getItemMenu(item, team);
			case "description":
				await delayMessage(`${item.name}: ${item.description}\n`);
				return this.getItemMenu(item, team);
			default:
				return false;
		}
	};

	getConsumables = async (
		returnFunction: () => void,
		team: LinemonProps[],
		location: "battle" | "inventory"
	): Promise<any> => {
		const consumableOptions: Option = [
			...this.createOptions(this.inventory.consumable),
			defaultOption,
		];

		const answer = await this.itemDefaultVerification(
			this.inventory.consumable,
			"Choose a consumable: ",
			consumableOptions,
			returnFunction
		);

		if (!answer) return;

		for (const item of this.inventory.consumable) {
			if (answer.selectedOption === item.id) {
				const response = await this.getItemMenu(item, team);

				if (response !== undefined) {
					if (location === "battle" && response) {
						return response;
					} else {
						return this.getConsumables(
							returnFunction,
							team,
							location
						);
					}
				}
			}
		}
	};

	getDisks = async (
		returnFunction: (
			linemon: LinemonProps,
			catchLinemon: boolean,
			diskBonus?: number
		) => void,
		linemon: LinemonProps
	) => {
		const diskOptions: Option = [
			...this.createOptions(this.inventory.disk),
			defaultOption,
		];

		const newReturnFunction = () => returnFunction(linemon, false);
		const answer = await this.itemDefaultVerification(
			this.inventory.disk,
			"Choose a floppy disk: ",
			diskOptions,
			newReturnFunction
		);

		if (!answer) return;

		for (const item of this.inventory.disk) {
			if (answer.selectedOption === item.id) {
				const itemAnswer = await createPrompt(
					item.name,
					extendedItemOptions
				);

				switch (itemAnswer.selectedOption) {
					case "use":
						const diskBonus = this.selectDiskBonus(
							item,
							linemon.info.type
						);

						this.removeFromInventory(item, this.inventory.disk);
						return returnFunction(linemon, true, diskBonus);
					case "quantity":
						await delayMessage(`Quantity: ${item.quantity}`);
						break;
					case "description":
						await delayMessage(`${item.name}: ${item.description}`);
						break;
				}

				console.log();
				this.getDisks(returnFunction, linemon);
			}
		}
	};

	private createItemMenus = async (
		items: InventoryItem[],
		options: Option,
		returnFunction: () => void,
		team: LinemonProps[]
	) => {
		const newReturnFunction = () => this.getInventory(returnFunction, team);
		const answer = await this.itemDefaultVerification(
			items,
			"Choose an item: ",
			options,
			newReturnFunction
		);

		if (!answer) return;

		for (const item of items) {
			if (answer.selectedOption === item.id) {
				const itemAnswer = await createPrompt(item.name, itemOptions);

				switch (itemAnswer.selectedOption) {
					case "quantity":
						await delayMessage(`Quantity: ${item.quantity}`);
						break;
					case "description":
						await delayMessage(`${item.name}: ${item.description}`);
						break;
				}

				console.log();
				this.getInventory(returnFunction, team);
			}
		}
	};

	hasFishingRod = () => {
		return this.inventory.special.some((e) => e.id === "fishingRod")
			? true
			: false;
	};
}
