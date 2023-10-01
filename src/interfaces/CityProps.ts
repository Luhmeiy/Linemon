import type { Option } from "../types/Option.js";
import type { ShopItemsIds } from "../types/ShopItemsIds.js";
import type { PlayerProps } from "./PlayerProps.js";

export interface CityProps {
	id: string;
	name: string;
	cityOptions: Option;
	shopItemsIds?: ShopItemsIds[];

	goToCityCenter: () => void;
	goToHealing: () => void;
	goToGrasslands: () => void;
	player: PlayerProps;
}
