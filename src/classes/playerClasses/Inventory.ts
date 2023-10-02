import type { IShopItems } from "../../interfaces/IShopItems.js";
import type {
	InventoryItem,
	InventoryProps,
} from "../../interfaces/PlayerProps.js";
import type { WildLinemonProps } from "../../interfaces/WildLinemonProps.js";
import type { Option } from "../../types/Option.js";

import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";

const inventoryOptions = [
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

const extendedItemOptions = itemOptions;
extendedItemOptions.unshift({
	name: "Use",
	value: "use",
});

const defaultOption = { name: "Go back", value: "back" };

export class Inventory implements InventoryProps {
	inventory: InventoryProps["inventory"];

	constructor() {
		this.inventory = {
			consumable: [],
			disk: [],
			special: [],
		};
	}

	getInventory = async (returnFunction: () => void) => {
		const consumableOptions: Option = [
			...this.createOptions(this.inventory.consumable),
			defaultOption,
		];
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
			inventoryOptions
		);

		await delayMessage(null);
		switch (answer.selectedOption) {
			case "consumable":
				await this.createItemMenus(
					this.inventory.consumable,
					consumableOptions,
					returnFunction
				);
				break;
			case "disk":
				await this.createItemMenus(
					this.inventory.disk,
					diskOptions,
					returnFunction
				);
				break;
			case "special":
				await this.createItemMenus(
					this.inventory.special,
					specialOptions,
					returnFunction
				);
				break;
			case "back":
				returnFunction();
				break;
		}
	};

	addToInventory = (item: IShopItems, quantity: number) => {
		const formattedItem = {
			id: item.id,
			name: item.name,
			description: item.description,
			quantity: quantity,
		};

		if (item.type === "consumable") {
			const response = this.increaseQuantityIfItemExists(
				this.inventory.consumable,
				item.name
			);

			if (!response) this.inventory.consumable?.push(formattedItem);
		} else if (item.type === "disk") {
			const response = this.increaseQuantityIfItemExists(
				this.inventory.disk,
				item.name
			);

			if (!response) this.inventory.disk?.push(formattedItem);
		} else if (item.type === "special") {
			const response = this.increaseQuantityIfItemExists(
				this.inventory.special,
				item.name
			);

			if (!response) this.inventory.special?.push(formattedItem);
		}
	};

	private increaseQuantityIfItemExists = (
		inventory: InventoryItem[],
		itemName: string
	) => {
		for (const item of inventory) {
			if (item.name === itemName) {
				item.quantity += 1;
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

	getDisks = async (
		returnFunction: (
			linemon: WildLinemonProps,
			catchLinemon: boolean,
			diskBonus?: number
		) => void,
		linemon: WildLinemonProps
	) => {
		const diskOptions: Option = [
			...this.createOptions(this.inventory.disk),
			defaultOption,
		];

		if (this.inventory.disk.length == 0) {
			console.log("No items");

			returnFunction(linemon, false);
		} else {
			const answer = await createPrompt("Choose an disk: ", diskOptions);

			if (answer.selectedOption !== "back") {
				for (const item of this.inventory.disk) {
					if (answer.selectedOption === item.id) {
						const itemAnswer = await createPrompt(
							item.name,
							extendedItemOptions
						);

						if (itemAnswer.selectedOption === "use") {
							const diskBonus = this.selectDiskBonus(item.id);
							this.removeFromInventory(item, this.inventory.disk);
							returnFunction(linemon, true, diskBonus);
						} else if (itemAnswer.selectedOption === "quantity") {
							await delayMessage(`Quantity: ${item.quantity}`);
							this.getDisks(returnFunction, linemon);
						} else if (
							itemAnswer.selectedOption === "description"
						) {
							await delayMessage(
								`${item.name}: ${item.description}`
							);

							this.getDisks(returnFunction, linemon);
						}
					}
				}
			} else {
				returnFunction(linemon, false);
			}
		}
	};

	private selectDiskBonus = (id: string) => {
		if (id === "disk") {
			return 1;
		} else if (id === "silverDisk") {
			return 2;
		} else if (id === "goldenDisk") {
			return 3;
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

	private createItemMenus = async (
		items: InventoryItem[],
		options: Option,
		returnFunction: () => void
	) => {
		if (items.length == 0) {
			console.log("No items");
			this.getInventory(returnFunction);
		} else {
			const answer = await createPrompt("Choose an item: ", options);

			if (answer.selectedOption !== "back") {
				for (const item of items) {
					if (answer.selectedOption === item.id) {
						const itemAnswer = await createPrompt(
							item.name,
							itemOptions
						);

						if (itemAnswer.selectedOption === "quantity") {
							await delayMessage(`Quantity: ${item.quantity}`);
						} else if (
							itemAnswer.selectedOption === "description"
						) {
							await delayMessage(
								`${item.name}: ${item.description}`
							);
						}

						this.getInventory(returnFunction);
					}
				}
			} else {
				this.getInventory(returnFunction);
			}
		}
	};
}
