import { create } from "zustand";
import type { Document } from "@/types/file";

interface FileStore {
  files: Document[];
  uploading: boolean;
  setFiles: (files: Document[]) => void;
  addFile: (file: Document) => void;
  updateFileStatus: (id: string, status: Document["status"]) => void;
  removeFile: (id: string) => void;
  setUploading: (v: boolean) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  uploading: false,
  setFiles: (files) => set({ files }),
  addFile: (file) => set((s) => ({ files: [file, ...s.files] })),
  updateFileStatus: (id, status) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, status } : f)),
    })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  setUploading: (uploading) => set({ uploading }),
}));
