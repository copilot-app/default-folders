export type Feature = null | "file-system" | "webkit";

export type FileEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file(successCallback: (file: File) => void, errorCallback?: (error: any) => void): void;
}
