import type { LinemonProps } from "../interfaces/LinemonProps.js";

export class Linemon implements LinemonProps {
	constructor(
		public id: LinemonProps["id"],
		public info: LinemonProps["info"],
		public status: LinemonProps["status"],
		public moves: LinemonProps["moves"]
	) {}
}
