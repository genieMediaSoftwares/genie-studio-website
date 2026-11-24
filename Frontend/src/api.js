// VITE_ variables are public. Backend credentials must never be configured here.
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
export default BASE_URL;
