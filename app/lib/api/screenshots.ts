import { apiGet } from "./client"
import type { PaginatedResponse, Screenshot, ScreenshotFilters } from "./types"

const SCREENSHOTS_PATH = "/api/v1/screenshots"

export const ScreenshotsService = {
  async list(
    filters?: ScreenshotFilters & { page?: number; limit?: number },
  ): Promise<PaginatedResponse<Screenshot>> {
    const params: Record<string, string | number | undefined> = {}

    if (filters) {
      if (filters.user_id && filters.user_id !== "all") {
        params["user_id"] = filters.user_id
      }
      if (filters.project_id && filters.project_id !== "all") {
        params["project_id"] = filters.project_id
      }
      if (filters.captured_after) {
        params["captured_after"] = filters.captured_after
      }
      if (filters.captured_before) {
        params["captured_before"] = filters.captured_before
      }
      if (filters.page) {
        params["page"] = filters.page
      }
      if (filters.limit) {
        params["limit"] = filters.limit
      }
    }

    return apiGet<PaginatedResponse<Screenshot>>(SCREENSHOTS_PATH, params)
  },
}
