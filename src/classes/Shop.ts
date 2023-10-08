import jsonShopItems from "../data/shopItems.json" assert { type: "json" };

import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";
import type { Option } from "../types/Option.js";
import type { ShopItemsIds } from "../types/ShopItemsIds.js";
import type { ShopMethods } from "../types/ShopMethods.js";

import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getFromJson } from "../utils/getFromJson.js";

const categoryOptions = [
	{ name: "Consumables", value: "consumable" },
	{ name: "Floppy Disks", value: "disk" },
	{ name: "Special Items", value: "special" },
	{ name: "Go back", value: "shopExit" },
];

const itemOptions = [
	{ name: "Buy", value: "buy" },
	{ name: "Description", value: "description" },
	{ name: "Go back", value: "back" },
];

export class Shop implements ShopMethods {
	private shopConsumableOptions: Option;
	private shopDiskOptions: Option;
	private shopSpecialOptions: Option;
	private shopItems: IShopItems[];

	constructor(
		private cityName: string,
		private shopItemsIds: ShopItemsIds[],
		private goToCityCenter: () => void,
		private player: PlayerMethods
	) {
		this.shopItems = this.getFullShopItems();

		this.shopConsumableOptions = this.filterByType("consumable");
		this.shopConsumableOptions.push({ name: "Go back", value: "back" });

		this.shopDiskOptions = this.filterByType("disk");
		this.shopDiskOptions.push({ name: "Go back", value: "back" });

		this.shopSpecialOptions = this.filterByType("special");
		this.shopSpecialOptions.push({ name: "Go back", value: "back" });
	}

	goToShop = async () => {
		console.log(`\nYou are in ${this.cityName}'s ${chalk.blue("shop")}.`);

		const filteredCategoryOptions = this.filterCategory();

		const categoryAnswer = await createPrompt(
			"What do you want to buy?",
			filteredCategoryOptions
		);

		if (categoryAnswer.selectedOption !== "shopExit") {
			let options: Option;

			switch (categoryAnswer.selectedOption) {
				case "consumable":
					options = this.shopConsumableOptions;
					break;
				case "disk":
					options = this.shopDiskOptions;
					break;
				case "special":
					options = this.shopSpecialOptions;
					break;
			}

			const answer = await createPrompt(
				"What do you want to buy?",
				options!
			);

			if (answer.selectedOption === "back") this.goToShop();

			for (const item of this.shopItems) {
				if (answer.selectedOption === item.id) {
					console.log(`You have ${this.player.getMoney()} coins.`);

					const itemAnswer = await createPrompt(
						item.name,
						itemOptions
					);

					if (itemAnswer.selectedOption === "buy") {
						if (this.player.getMoney() < item.price) {
							const spinner = createSpinner("").start();
							spinner.error({ text: "Not enough money." });
						} else {
							const numberAnswer = await inquirer.prompt([
								{
									type: "number",
									name: "numberOfItems",
									message: `How many ${item.name} you want to buy?`,
								},
							]);

							if (!(numberAnswer.numberOfItems === 0)) {
								const spinner = createSpinner("").start();

								if (
									this.player.getMoney() <
									item.price * numberAnswer.numberOfItems
								) {
									spinner.error({
										text: "Not enough money.",
									});
								} else {
									this.player.addToInventory(
										item,
										numberAnswer.numberOfItems
									);
									this.player.setMoney(
										-item.price * numberAnswer.numberOfItems
									);

									spinner.success({
										text: `You bought ${
											numberAnswer.numberOfItems
										} ${chalk.bold(item.name)}.`,
									});
								}
							} else {
								const spinner = createSpinner("").start();
								spinner.error({ text: "No items bought." });
							}
						}

						await delayMessage(null);
					} else if (itemAnswer.selectedOption === "description") {
						await delayMessage(`${item.name}: ${item.description}`);
					}

					this.goToShop();
				}
			}
		} else {
			await delayMessage("You left.");
			this.goToCityCenter();
		}
	};

	private getFullShopItems = () => {
		const shopItems: IShopItems[] = this.shopItemsIds.map((id) =>
			getFromJson(jsonShopItems, id)
		);

		return shopItems;
	};

	private formatItem = (name: string, price: number) => {
		const spacing = ".".repeat(30 - name.length - price.toString().length);

		return `${name}${spacing}${price}`;
	};

	private filterByType = (type: IShopItems["type"]): Option => {
		//@ts-ignore
		return this.shopItems
			.filter((item) => item.type === type)
			.map((item) => {
				return {
					name: this.formatItem(item.name, item.price),
					value: item.id,
				};
			});
	};

	private filterCategory = () => {
		let newCategoryOptions = [...categoryOptions];

		if (this.shopSpecialOptions.length === 1) {
			newCategoryOptions.splice(2, 1);
		}

		return newCategoryOptions;
	};
}
