import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { PCMethods } from "@/interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { createLinemonsMenu } from "@/utils/createLinemonsMenu.js";
import { delayMessage } from "@/utils/delayMessage.js";

export class PC implements PCMethods {
	private pc: LinemonProps[];

	constructor(
		private addToTeam: (
			linemon: LinemonProps
		) => Promise<LinemonProps | undefined>,
		pc?: LinemonProps[]
	) {
		if (pc) {
			this.pc = pc.map((linemon) => {
				return new Linemon(linemon as Linemon);
			});
		} else {
			this.pc = [];
		}
	}

	getPC = async (url: string) => {
		await createLinemonsMenu(
			"pc",
			this.pc,
			this.addToTeam,
			this.switchLinemon,
			this.removeFromPC,
			url
		);
	};

	addToPC = async (linemon: LinemonProps) => {
		await delayMessage(`${linemon.info.name} sent to PC.\n`);
		this.pc.push(linemon);
	};

	private switchLinemon = (
		firstLinemonId: string,
		secondLinemonId: string
	) => {
		const firstIndex = this.pc.findIndex(
			(linemon) => linemon.referenceId === firstLinemonId
		);
		const secondIndex = this.pc.findIndex(
			(linemon) => linemon.referenceId === secondLinemonId
		);

		[this.pc[firstIndex], this.pc[secondIndex]] = [
			this.pc[secondIndex],
			this.pc[firstIndex],
		];

		return this.pc;
	};

	private removeFromPC = (linemonId: string) => {
		this.pc = this.pc.filter(
			(linemon) => linemon.referenceId !== linemonId
		);

		return this.pc;
	};
}
