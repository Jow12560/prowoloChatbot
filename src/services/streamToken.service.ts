import { authAxiosClient } from "../config/axios.config";

export interface StreamTokenResponse {
  token: string;
  apiKey: string;
}

// ✅ Fetch Stream token from backend
export async function getStreamToken(user_id: string): Promise<StreamTokenResponse> {
  try {
    const response = await authAxiosClient.get(`/stream/token`, {
      params: { user_id },
    });

    if (response.status !== 200) {
      throw new Error("Failed to get Stream Chat token");
    }

    return response.data as StreamTokenResponse;
  } catch (error: any) {
    console.error("Error fetching Stream Chat token:", error.message);
    throw new Error(
      "Failed to fetch Stream Chat token: " +
        (error.response?.data?.message || error.message)
    );
  }
}

export default { getStreamToken };