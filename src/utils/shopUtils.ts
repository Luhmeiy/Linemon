import jsonShopItems from "@/data/shopItems.json";

import chalk from "chalk";
import { createSpinner } from "nanospinner";
import input from "@inquirer/input";

import { IShopItems } from "@/interfaces/IShopItems.js";

import { player } from "@/routes/map/index.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getFromJson } from "./getFromJson.js";

export const itemOptions = [
	{ name: "Buy", value: "buy" },
	{ name: "Description", value: "description" },
	{ name: "Go back", value: "back" },
];

export const formatItem = (name: string, price: number) => {
	const spacing = ".".repeat(30 - name.length - price.toString().length);

	return `${name}${spacing}${price}`;
};

export const getFullShopItems = (shopItemsIds: string[]) => {
	const shopItems: IShopItems[] = shopItemsIds.map((id) =>
		getFromJson(jsonShopItems, id)
	);

	return shopItems;
};

export const getItemMenu = async (
	item: IShopItems,
	routeFunction: () => void,
	returnFunction: () => void
) => {
	const money = player.getMoney();

	console.log(`\nYou have ${chalk.blue(money)} coins.`);

	const itemAnswer = await createPrompt(item.name, itemOptions);

	switch (itemAnswer) {
		case "buy":
			const spinner = createSpinner("");

			if (money < item.price) {
				spinner.error({ text: "Not enough money." });
				break;
			}

			const numberOfItems = Number(
				await input({
					message: `How many ${item.name} do you want to buy?`,
				})
			);

			if (numberOfItems <= 0 || isNaN(numberOfItems)) {
				spinner.error({ text: "No items bought." });
				break;
			}

			if (money < item.price * numberOfItems) {
				spinner.error({ text: "Not enough money." });
				break;
			}

			if (item.category === "special" && numberOfItems > 1) {
				spinner.error({ text: "You can only buy one." });
				break;
			}

			player.inventory.addToInventory(item, numberOfItems);
			player.setMoney(-item.price * numberOfItems);

			spinner.success({
				text: `You bought ${numberOfItems} ${chalk.bold(item.name)}.`,
			});

			await delayMessage(null);

			if (item.category === "special") {
				return await routeFunction();
			}

			return await returnFunction();
		case "description":
			await delayMessage(`${item.name}: ${item.description}`);
			break;
		default:
			return await returnFunction();
	}

	await getItemMenu(item, routeFunction, returnFunction);
};
