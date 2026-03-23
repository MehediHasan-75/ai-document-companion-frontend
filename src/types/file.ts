export type FileStatus = "uploaded" | "processing" | "processed" | "failed" | "deleted";

export type FileType = "pdf" | "docx" | "txt" | "md" | "html" | "other";

export interface Document {
  id: string;
  filename: string;
  status: FileStatus;
  type: FileType;
  created_at: string;
  // populated by backend once processing completes
  page_count?: number;
  chunk_count?: number;
  image_count?: number;
  table_count?: number;
  file_size?: number; // bytes
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
