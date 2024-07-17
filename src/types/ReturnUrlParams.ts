import { Linemon } from "@/classes/Linemon";
import { FindingSettings } from "@/interfaces/LocationProps";

export type ReturnUrlParams = {
	findingSettings: FindingSettings;
	url: string;
	wildLinemon: Linemon;
};
