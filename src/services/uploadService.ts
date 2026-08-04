import { apiClient } from "@/api/apiClient";

export type UploadResponse = {
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAtUtc: string;
};

export const uploadQueryKey = ["uploads"] as const;

export const uploadService = {
  getAll: (token: string, signal: AbortSignal) =>
    apiClient<UploadResponse[]>("/api/uploads", {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    }),
  upload: (image: File, token: string) => {
    const body = new FormData();
    body.append("image", image);
    return apiClient<UploadResponse>("/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  },
  delete: (fileName: string, token: string) =>
    apiClient<void>(`/api/uploads/${encodeURIComponent(fileName)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
