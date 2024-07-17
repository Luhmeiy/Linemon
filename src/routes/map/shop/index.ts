import chalk from "chalk";
import { Request } from "express";
import input from "@inquirer/input";
import { createSpinner } from "nanospinner";

import jsonShopItems from "@/data/shopItems.json";
import { IShopItems } from "@/interfaces/IShopItems";
import { Option } from "@/types/Option";

import { player } from "..";
import { createPrompt } from "@/utils/createPrompt";
import { delayMessage } from "@/utils/delayMessage";
import { getFromJson } from "@/utils/getFromJson";
import { getRoute } from "@/utils/getRoute";

interface ShopProps {
	cityName: string;
	shopItemsIds: string;
	url: string;
}

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

const getFullShopItems = (shopItemsIds: string) => {
	const shopItems: IShopItems[] = shopItemsIds
		.split(",")
		.map((id) => getFromJson(jsonShopItems, id));

	return shopItems;
};

const formatItem = (name: string, price: number) => {
	const spacing = ".".repeat(30 - name.length - price.toString().length);

	return `${name}${spacing}${price}`;
};

const filterByCategory = (
	shopItems: IShopItems[],
	category: IShopItems["category"]
): Option => {
	//@ts-ignore
	return shopItems
		.filter((item) => item.category === category)
		.map((item) => {
			return {
				name: formatItem(item.name, item.price),
				value: item.id,
			};
		});
};

const filterCategory = (shopSpecialOptions: Option) => {
	let newCategoryOptions = [...categoryOptions];

	if (shopSpecialOptions.length === 1) {
		newCategoryOptions.splice(2, 1);
	}

	return newCategoryOptions;
};

export default async (req: Request<{}, {}, {}, ShopProps>) => {
	const { cityName, shopItemsIds, url } = req.query;

	const shopItems = getFullShopItems(shopItemsIds);

	const shopConsumableOptions = filterByCategory(shopItems, "consumable");
	shopConsumableOptions.push({ name: "Go back", value: "back" });

	const shopDiskOptions = filterByCategory(shopItems, "disk");
	shopDiskOptions.push({ name: "Go back", value: "back" });

	const shopSpecialOptions = filterByCategory(shopItems, "special");
	shopSpecialOptions.push({ name: "Go back", value: "back" });

	console.log(`\nYou are in ${cityName}'s ${chalk.blue("shop")}.`);

	const filteredCategoryOptions = filterCategory(shopSpecialOptions);

	const categoryAnswer = await createPrompt(
		"What do you want to buy?",
		filteredCategoryOptions
	);

	let options: Option;

	switch (categoryAnswer) {
		case "consumable":
			options = shopConsumableOptions;
			break;
		case "disk":
			options = shopDiskOptions;
			break;
		case "special":
			options = shopSpecialOptions;
			break;
		default:
			await delayMessage("You left.");
			return await getRoute(url);
	}

	const answer = await createPrompt("What do you want to buy?", options!);

	if (answer === "back") {
		return await getRoute(
			`map/shop?cityName=${cityName}&shopItemsIds=${shopItemsIds}&url=${url}`
		);
	}

	for (const item of shopItems) {
		if (answer === item.id) {
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
							message: `How many ${item.name} you want to buy?`,
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

					player.addToInventory(item, numberOfItems);
					player.setMoney(-item.price * numberOfItems);

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

			await getRoute(
				`map/shop?cityName=${cityName}&shopItemsIds=${shopItemsIds}&url=${url}`
			);
		}
	}
};
