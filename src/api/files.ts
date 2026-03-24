import api from "./client";
import type { Document, FileListResponse, ProcessingStatus } from "@/types/file";

export const filesApi = {
  list: (page = 1, limit = 20) =>
    api.get<FileListResponse>("/files", { params: { page, limit } }).then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<{ file_id: string; message: string }>("/files/upload", form)
      .then((r) => r.data);
  },

  process: (fileId: string) =>
    api.post(`/files/process/${fileId}`).then((r) => r.data),

  get: (fileId: string) =>
    api.get<Document>(`/files/${fileId}`).then((r) => r.data),

  status: (fileId: string) =>
    api.get<ProcessingStatus>(`/files/status/${fileId}`).then((r) => r.data),

  delete: (fileId: string) =>
    api.delete("/files/delete", { params: { file_id: fileId } }).then((r) => r.data),
};
