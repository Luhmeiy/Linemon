import type { Option } from "../types/Option.js";
import type { ShopItemsIds } from "../types/ShopItemsIds.js";

export interface CityProps {
	id: string;
	name: string;
	cityOptions: Option;
	shopItemsIds?: ShopItemsIds[];

	goToCityCenter: () => void;
	goToHealing: () => void;
	goToGrasslands: () => void;
}
