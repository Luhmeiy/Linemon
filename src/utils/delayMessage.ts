export const delayMessage = async (message: string | null, delay?: number) => {
	const sleep = (ms = delay || 2000) => new Promise((r) => setTimeout(r, ms));

	if (message) console.log(message);
	await sleep();
};
