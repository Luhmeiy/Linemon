import { Linemon } from "@/classes/Linemon.js";
import { FindingSettings } from "@/interfaces/LocationProps.js";

export type ReturnUrlParams = {
	findingSettings: FindingSettings;
	url: string;
	wildLinemon: Linemon;
};
