import { ShopItemsIds } from "../types/ShopItemsIds.js";

export interface IShopItems {
	id: ShopItemsIds;
	name: string;
	description: string;
	price: number;
}
