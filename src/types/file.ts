export type FileStatus = "uploaded" | "processing" | "processed" | "failed" | "deleted";

export type FileType = "pdf" | "docx" | "txt" | "md" | "html" | "other";

export interface Document {
  id: string;
  filename: string;
  status: FileStatus;
  type: FileType;
  created_at: string;
}

export interface FileListResponse {
  files: Document[];
  total: number;
  page: number;
  limit: number;
}

export interface ProcessingStatus {
  file_id: string;
  status: FileStatus;
  error?: string;
}
