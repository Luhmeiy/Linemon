import { IShopItems } from "./IShopItems.js";
import { Option } from "../types/Option.js";
import { ShopItemsIds } from "../types/ShopItemsIds.js";

export interface ShopProps {
	cityName: string;

	shopOptions: Option;
	shopItemsIds: ShopItemsIds[];
	shopItems: IShopItems[];

	goToCityCenter: () => void;
	goToShop: () => void;
	getFullShopItems: () => IShopItems[];
	formatItem: (name: string, price: number) => string;
	createShopOptions: () => Option;
}
