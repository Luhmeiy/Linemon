import { LinemonProps } from "@/interfaces/LinemonProps";
import { FindingSettings } from "@/interfaces/LocationProps";

export type ReturnUrlParams = {
	findingSettings: FindingSettings;
	url: string;
	wildLinemon: LinemonProps;
};
