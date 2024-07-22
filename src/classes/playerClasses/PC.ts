import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { PCMethods } from "@/interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { player } from "@/routes/map/index.js";
import { createLinemonsMenu } from "@/utils/createLinemonsMenu.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { switchLinemon } from "@/utils/switchLinemon.js";

export class PC implements PCMethods {
	private pc: LinemonProps[];

	constructor(pc) {
		this.pc = pc ? pc.pc.map((linemon) => new Linemon(linemon)) : [];
	}

	getPC = async (url: string) => {
		await createLinemonsMenu(
			"pc",
			this.pc,
			player.team.addToTeam,
			this.switchLinemon,
			this.removeFromPC,
			url
		);
	};

	addToPC = async (linemon: LinemonProps) => {
		await delayMessage(`${linemon.info.name} sent to PC.\n`);
		this.pc.push(linemon);
	};

	private switchLinemon = async (
		firstLinemonId: string,
		secondLinemonId: string
	) => {
		this.pc = await switchLinemon(this.pc, firstLinemonId, secondLinemonId);
		return this.pc;
	};

	private removeFromPC = (linemonId: string) => {
		this.pc = this.pc.filter(
			({ referenceId }) => referenceId !== linemonId
		);

		return this.pc;
	};
}
