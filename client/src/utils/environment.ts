const isDev = import.meta.env.MODE === "development";
const wsURL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;
const baseURL = isDev ? import.meta.env.VITE_BASE_URL_DEV : import.meta.env.VITE_BASE_URL;

export { wsURL, baseURL };
