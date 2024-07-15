import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:3000/",
});

export const getRoute = async (url: string, params?: any) => {
	await api.get(url, { params }).then((response) => {
		console.log(response.data);
	});
};
