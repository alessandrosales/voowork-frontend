import { apiGet } from "./client"
import type {
  ProjectTimeResponse,
  TimelineResponse,
  TaskTimeResponse,
  UserTimeResponse,
  ScreenshotFilters,
} from "./types"

const REPORTS_PATH = "/api/v1/reports"

export const ReportsService = {
  async projectTime(
    filters?: ScreenshotFilters,
  ): Promise<ProjectTimeResponse> {
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
    }

    return apiGet<ProjectTimeResponse>(`${REPORTS_PATH}/project_time`, params)
  },

  async timeline(
    filters?: ScreenshotFilters,
  ): Promise<TimelineResponse> {
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
    }

    return apiGet<TimelineResponse>(`${REPORTS_PATH}/timeline`, params)
  },

  async taskTime(
    filters?: ScreenshotFilters,
  ): Promise<TaskTimeResponse> {
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
    }

    return apiGet<TaskTimeResponse>(`${REPORTS_PATH}/task_time`, params)
  },

  async userTime(
    filters?: ScreenshotFilters,
  ): Promise<UserTimeResponse> {
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
    }

    return apiGet<UserTimeResponse>(`${REPORTS_PATH}/user_time`, params)
  },
}
