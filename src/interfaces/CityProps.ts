import type { Option } from "../types/Option.js";
import type { ShopItemsIds } from "../types/ShopItemsIds.js";

export type CityMethods = { goToCityCenter: () => void };

export interface CityProps {
	name: string;
	cityOptions: Option;
	shopItemsIds: ShopItemsIds[];
}
