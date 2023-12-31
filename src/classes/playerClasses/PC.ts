import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type { PCMethods } from "../../interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { createLinemonsMenu } from "../../utils/createLinemonsMenu.js";
import { delayMessage } from "../../utils/delayMessage.js";

export class PC implements PCMethods {
	private pc: LinemonProps[];

	constructor(
		private addToTeam: (
			linemon: LinemonProps
		) => Promise<LinemonProps | undefined>,
		pc?: LinemonProps[]
	) {
		if (pc) {
			this.pc = pc.map(({ id, info, status, moves }) => {
				return new Linemon(id, info, status, moves);
			});
		} else {
			this.pc = [];
		}
	}

	getPC = async (returnFunction: () => void) => {
		await createLinemonsMenu(
			"pc",
			this.pc,
			this.addToTeam,
			this.removeFromPC,
			returnFunction
		);
	};

	addToPC = async (linemon: LinemonProps) => {
		await delayMessage(`${linemon.info.name} sent to PC.\n`);
		this.pc.push(linemon);
	};

	private removeFromPC = (linemonId: number) => this.pc.splice(linemonId, 1);
}
