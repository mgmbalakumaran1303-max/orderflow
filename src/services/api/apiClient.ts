import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
