import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type { PCMethods } from "../../interfaces/PlayerMethods.js";

import { delayMessage } from "../../utils/delayMessage.js";

export class PC implements PCMethods {
	private PC: LinemonProps[];

	constructor() {
		this.PC = [];
	}

	getPC = async (returnFunction: () => void) => {
		if (this.PC.length === 0) {
			await delayMessage("No linemons in PC.\n");
		} else {
			for (const linemon of this.PC) {
				console.log(linemon.info.name);
			}

			await delayMessage(null);
		}

		returnFunction();
	};

	addToPC = async (linemon: LinemonProps) => {
		await delayMessage(`${linemon.info.name} sent to PC.\n`);
		this.PC.push(linemon);
	};
}
