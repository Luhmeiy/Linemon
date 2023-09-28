export const delayMessage = async (message: string | null) => {
	const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

	if (message) console.log(message);
	await sleep();
};
