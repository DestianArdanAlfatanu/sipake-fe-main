import axiosBase from "axios";

const axios = axiosBase.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
});

export default axios;
