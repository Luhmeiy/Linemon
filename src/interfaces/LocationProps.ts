import type { Option } from "@/types/Option.js";

export type FindingSettings = {
	findingChance?: number;
	level?: {
		min: number;
		max: number;
	};
	location?: "tallGrass" | "water";
};

export interface LocationProps {
	name: string;
	type: string;
	routes: string[];
	locationOptions: Option;
	shopItemsIds?: string[];
	linemonOptions?: string[];
	secondaryLinemonOptions?: string[];
	findingSettings: FindingSettings;
	secondaryFindingSettings: FindingSettings;
}
