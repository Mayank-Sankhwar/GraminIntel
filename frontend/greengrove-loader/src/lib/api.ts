import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface SignupData {
    username: string;
    email: string;
    code: number;
    phone_number: string;
    disability_is: boolean;
    disability_type: "Visual Impairment" | "Hearing Impairment" | "Speech Disability" | "other";
    answer_preference: "voice" | "chat";
}

export const authApi = {
    signIn: async (phone_number: string, code: number) => {
        const response = await api.post("/signin", { phone_number, code });
        return response.data;
    },
    signUp: async (data: SignupData) => {
        const response = await api.post("/signup", data);
        return response.data;
    },
    getProfile: async (userId: string) => {
        const response = await api.get(`/getprofile/${userId}`);
        return response.data;
    },
    saveFarmerInfo: async (data: { userId: string, location: string, soilType: string, landSize: number }) => {
        const response = await api.post("/farmer-info", data);
        return response.data;
    },
    getWeather: async (userId: string) => {
        const response = await api.get(`/weather/${userId}`);
        return response.data;
    },
};

export default api;
