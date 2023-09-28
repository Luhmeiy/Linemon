import { Option } from "../types/Option.js";

export interface CityProps {
	name: string;
	cityOptions: Option;
	shopOptions: Option;
	healingOptions: Option;

	goToCity: () => void;
	goToShop: () => void;
	goToHealing: () => void;
}
