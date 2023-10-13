import type { Option } from "../types/Option.js";

export type CityMethods = { goToCityCenter: () => void };

export interface CityProps {
	name: string;
	cityOptions: Option;
	shopItemsIds: string[];
}
