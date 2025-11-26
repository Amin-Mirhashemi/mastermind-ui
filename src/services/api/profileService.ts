import { apiClient } from "./client";
import { ProfileRequest, ProfileResponse } from "./types";

export class ProfileService {
  /**
   * Create or update user profile
   */
  static async createProfile(
    request: ProfileRequest
  ): Promise<ProfileResponse> {
    return await apiClient.post<ProfileResponse>("/profile", request);
  }
}
