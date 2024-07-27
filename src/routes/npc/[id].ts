import { Request } from "express";

import { npcs, player } from "../map/index.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";

export default async (
	req: Request<{ id: string }, {}, {}, { url: string }>
) => {
	const { id } = req.params;
	const { url } = req.query;

	const npc = npcs.find((npc) => npc.id === id);

	let dialogPosition = 1;
	const dialogMenu = async () => {
		const dialog = npc.dialog[dialogPosition];

		await delayMessage(`\n${dialog.text}`);

		const answer = await createPrompt("", dialog.options);

		await delayMessage(null);
		switch (answer) {
			case "shop":
				return await npc.getShop(url);
			case "fight":
				if (npc.getFirstTeam() === undefined) {
					await delayMessage(npc.dialog["fight"].defeatedTeamText);
					return await getRoute(`npc/${id}`, { url });
				}

				await delayMessage(npc.dialog["fight"].battleStartText);
				return await npc.getFight(url, { battleStart: true });
			case "gift":
				if (npc.gift) {
					await delayMessage(npc.dialog["gift"].giftConfirm);

					player.inventory.addToInventory(npc.gift, npc.giftQuantity);

					await delayMessage(
						`\nYou received ${npc.giftQuantity} ${npc.gift.name}${
							npc.giftQuantity > 1 ? "s" : ""
						}!`
					);

					npc.gift = undefined;
				} else {
					await delayMessage(npc.dialog["gift"].giftReceived);
				}

				return await getRoute(`npc/${id}`, { url });
			case "back":
				return await getRoute(url);
			default:
				dialogPosition = Number(answer);
				return await dialogMenu();
		}
	};

	await dialogMenu();
};
