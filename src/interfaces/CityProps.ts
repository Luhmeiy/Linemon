import { Option } from "../types/Option.js";
import { ShopItemsIds } from "../types/ShopItemsIds.js";

export interface CityProps {
	name: string;
	cityOptions: Option;
	healingOptions: Option;
	shopItemsIds: ShopItemsIds[];

	goToCityCenter: () => void;
	goToHealing: () => void;
	goToGrasslands: () => void;
}
