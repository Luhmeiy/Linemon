import type { IShopItems } from "./IShopItems.js";
import type { Option } from "../types/Option.js";
import type { ShopItemsIds } from "../types/ShopItemsIds.js";

export interface ShopProps {
	cityName: string;

	shopConsumableOptions: Option;
	shopDiskOptions: Option;
	shopSpecialOptions?: Option;

	shopItemsIds: ShopItemsIds[];
	shopItems: IShopItems[];

	goToCityCenter: () => void;
	goToShop: () => void;
	getFullShopItems: () => IShopItems[];
	formatItem: (name: string, price: number) => string;
	filterByType: (type: IShopItems["type"]) => Option;
	filterCategory: () => void;
}
