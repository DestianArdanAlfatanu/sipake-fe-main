import axiosBase from "axios";

// Ambil alamat dari .env, kalau tidak ada/error, pake alamat cadangan (127.0.0.1)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const axios = axiosBase.create({
    baseURL: API_URL,
});

export default axios;