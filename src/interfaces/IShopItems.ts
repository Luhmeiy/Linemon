export interface IShopItems {
	id: string;
	name: string;
	description: string;
	price: number;
	category: "consumable" | "disk" | "special";
	type?: string;
	health?: number;
	bonus?:
		| number
		| {
				[type: string]: number;
		  };
}
