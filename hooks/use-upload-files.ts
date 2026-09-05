import { uploadFiles } from '@/network/upload/upload-files';

/** Compatibility hook; upload orchestration lives outside React. */
export default function useUploadFiles() {
  return uploadFiles;
}
