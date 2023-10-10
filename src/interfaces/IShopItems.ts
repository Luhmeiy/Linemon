export interface IShopItems {
	id: string;
	name: string;
	description: string;
	price: number;
	type: "consumable" | "disk" | "special";
}
