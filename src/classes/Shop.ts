import jsonShopItems from "../data/shopItems.json" assert { type: "json" };

import chalk from "chalk";
import { createSpinner } from "nanospinner";

import type { IShopItems } from "../interfaces/IShopItems.js";
import type { PlayerProps } from "../interfaces/PlayerProps.js";
import type { ShopProps } from "../interfaces/ShopProps.js";
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

export class Shop implements ShopProps {
	shopConsumableOptions: Option;
	shopDiskOptions: Option;
	shopSpecialOptions: Option;
	shopItems: IShopItems[];

	constructor(
		public cityName: ShopProps["cityName"],
		public shopItemsIds: ShopProps["shopItemsIds"],
		public goToCityCenter: ShopProps["goToCityCenter"],
		private player: PlayerProps
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

			if (categoryAnswer.selectedOption === "consumable") {
				options = this.shopConsumableOptions;
			} else if (categoryAnswer.selectedOption === "disk") {
				options = this.shopDiskOptions;
			} else if (categoryAnswer.selectedOption === "special") {
				options = this.shopSpecialOptions;
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
						const spinner = createSpinner("Run test").start();
						if (this.player.getMoney() < item.price) {
							spinner.error({ text: "Not enough money." });
						} else {
							this.player.addToInventory(item, 1);
							this.player.setMoney(-item.price);
							spinner.success({
								text: `You bought a ${item.name}.`,
							});
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

	getFullShopItems = () => {
		const shopItems: IShopItems[] = this.shopItemsIds.map((id) =>
			getFromJson(jsonShopItems, id)
		);

		return shopItems;
	};

	formatItem = (name: string, price: number) => {
		const spacing = ".".repeat(30 - name.length - price.toString().length);

		return `${name}${spacing}${price}`;
	};

	filterByType = (type: IShopItems["type"]): Option => {
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

	filterCategory = () => {
		return categoryOptions.filter((category) => {
			if (this.shopSpecialOptions.length === 1) {
				return category.value !== "special";
			} else true;
		});
	};
}
