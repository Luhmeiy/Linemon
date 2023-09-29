import { Option } from "../types/Option.js";

export interface CityProps {
	name: string;
	cityOptions: Option;
	shopOptions: Option;
	healingOptions: Option;

	goToCityCenter: () => void;
	goToShop: () => void;
	goToHealing: () => void;
	goToGrasslands: () => void;
}
