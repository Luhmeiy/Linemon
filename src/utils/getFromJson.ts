export const getFromJson = (jsonData: any[], id: string | number) => {
	return jsonData.find((item: any) => item.id === id);
};
