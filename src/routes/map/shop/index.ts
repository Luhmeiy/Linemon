import chalk from "chalk";
import { Request } from "express";

import { IShopItems } from "@/interfaces/IShopItems.js";
import { Option } from "@/types/Option.js";

import { player } from "../index.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";
import {
	formatItem,
	getFullShopItems,
	getItemMenu,
} from "@/utils/shopUtils.js";

interface ShopProps {
	cityName: string;
	shopItemsIds: string[];
	url: string;
}

const categoryOptions = [
	{ name: "Consumables", value: "consumable" },
	{ name: "Floppy Disks", value: "disk" },
	{ name: "Special Items", value: "special" },
	{ name: "Go back", value: "shopExit" },
];

const verifyIfPlayerHasSpecialItem = (shopSpecialOptions: Option) => {
	shopSpecialOptions.map((option, i) => {
		if (
			player.inventory
				.getSpecialItems()
				.some(({ id }) => id === option.value)
		) {
			shopSpecialOptions.splice(i, 1);
		}
	});
};

const filterByCategory = (
	shopItems: IShopItems[],
	category: IShopItems["category"]
): Option => {
	//@ts-ignore
	return shopItems
		.filter((item) => item.category === category)
		.map(({ name, price, id }) => {
			return {
				name: formatItem(name, price),
				value: id,
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

	verifyIfPlayerHasSpecialItem(shopSpecialOptions);

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

	const getCategoryMenu = async () => {
		const answer = await createPrompt("What do you want to buy?", options!);

		if (answer === "back") {
			return await getRoute("map/shop", {
				cityName,
				shopItemsIds,
				url,
			});
		}

		for (const item of shopItems) {
			if (answer === item.id)
				await getItemMenu(
					item,
					() =>
						getRoute("map/shop", {
							cityName,
							shopItemsIds,
							url,
						}),
					getCategoryMenu
				);
		}
	};

	getCategoryMenu();
};
