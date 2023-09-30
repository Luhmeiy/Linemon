import jsonShopItems from "../data/shopItems.json" assert { type: "json" };

import chalk from "chalk";

import { IShopItems } from "../interfaces/IShopItems.js";
import { ShopProps } from "../interfaces/ShopProps.js";
import { Option } from "../types/Option.js";

import { createPrompt } from "../utils/createPrompt.js";
import { delayMessage } from "../utils/delayMessage.js";
import { getFromJson } from "../utils/getFromJson.js";

const itemOptions = [
	{ name: "Buy", value: "buy" },
	{ name: "Description", value: "description" },
	{ name: "Go back", value: "back" },
];

export class Shop implements ShopProps {
	shopOptions: Option;
	shopItems: IShopItems[];

	constructor(
		public cityName: ShopProps["cityName"],
		public shopItemsIds: ShopProps["shopItemsIds"],
		public goToCityCenter: ShopProps["goToCityCenter"]
	) {
		this.shopItems = this.getFullShopItems();
		this.shopOptions = this.createShopOptions();
	}

	goToShop = async () => {
		console.log(`\nYou are in ${this.cityName}'s ${chalk.blue("shop")}.`);

		const answer = await createPrompt(
			"What do you want to buy?",
			this.shopOptions
		);

		if (answer.selectedOption !== "shopExit") {
			for (const item of this.shopItems) {
				if (answer.selectedOption === item.id) {
					const itemAnswer = await createPrompt(
						item.name,
						itemOptions
					);

					if (itemAnswer.selectedOption === "buy") {
						await delayMessage(`You bought a ${item.name}.`);
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

	createShopOptions = () => {
		const shopOptions: Option = this.shopItems.map((item) => {
			return {
				name: this.formatItem(item.name, item.price),
				value: item.id,
			};
		});

		shopOptions.push({ name: "Go back", value: "shopExit" });

		return shopOptions;
	};
}
