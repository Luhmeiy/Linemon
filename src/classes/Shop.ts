import jsonShopItems from "../data/shopItems.json" assert { type: "json" };

import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";
import type { Option } from "../types/Option.js";

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

export class Shop {
	private shopConsumableOptions: Option;
	private shopDiskOptions: Option;
	private shopSpecialOptions: Option;
	private shopItems: IShopItems[];

	constructor(
		private cityName: string,
		private shopItemsIds: string[],
		private goToCityCenter: () => void,
		private player: PlayerMethods
	) {
		this.shopItems = this.getFullShopItems();

		this.shopConsumableOptions = this.filterByCategory("consumable");
		this.shopConsumableOptions.push({ name: "Go back", value: "back" });

		this.shopDiskOptions = this.filterByCategory("disk");
		this.shopDiskOptions.push({ name: "Go back", value: "back" });

		this.shopSpecialOptions = this.filterByCategory("special");
		this.shopSpecialOptions.push({ name: "Go back", value: "back" });
	}

	goToShop = async () => {
		console.log(`\nYou are in ${this.cityName}'s ${chalk.blue("shop")}.`);

		const filteredCategoryOptions = this.filterCategory();

		const categoryAnswer = await createPrompt(
			"What do you want to buy?",
			filteredCategoryOptions
		);

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
			default:
				await delayMessage("You left.");
				return this.goToCityCenter();
		}

		const answer = await createPrompt("What do you want to buy?", options!);

		if (answer.selectedOption === "back") this.goToShop();

		for (const item of this.shopItems) {
			if (answer.selectedOption === item.id) {
				const money = this.player.getMoney();

				console.log(`\nYou have ${chalk.blue(money)} coins.`);

				const itemAnswer = await createPrompt(item.name, itemOptions);

				switch (itemAnswer.selectedOption) {
					case "buy":
						const spinner = createSpinner("");

						if (money < item.price) {
							spinner.error({ text: "Not enough money." });
							break;
						}

						const { numberOfItems } = await inquirer.prompt([
							{
								type: "number",
								name: "numberOfItems",
								message: `How many ${item.name} you want to buy?`,
							},
						]);

						if (numberOfItems <= 0 || isNaN(numberOfItems)) {
							spinner.error({ text: "No items bought." });
							break;
						}

						if (money < item.price * numberOfItems) {
							spinner.error({ text: "Not enough money." });
							break;
						}

						this.player.addToInventory(item, numberOfItems);
						this.player.setMoney(-item.price * numberOfItems);

						spinner.success({
							text: `You bought ${numberOfItems} ${chalk.bold(
								item.name
							)}.`,
						});

						await delayMessage(null);
						break;
					case "description":
						await delayMessage(`${item.name}: ${item.description}`);
						break;
				}

				this.goToShop();
			}
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

	private filterByCategory = (category: IShopItems["category"]): Option => {
		//@ts-ignore
		return this.shopItems
			.filter((item) => item.category === category)
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
