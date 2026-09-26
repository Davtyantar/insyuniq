import type { DraftPhoto } from "@/lib/draft";

/** Uploads, in order, every photo that has a file and no object path yet. Finished photos are
 * skipped, so publishing again after a failure resumes where it stopped. `onChange` reports each
 * status change so the photo step can show progress. */
export async function uploadDraftPhotos(
  photos: DraftPhoto[],
  upload: (file: File) => Promise<string>,
  onChange: (photos: DraftPhoto[]) => void,
): Promise<{ photos: DraftPhoto[]; failed: number }> {
  let current = [...photos];
  let failed = 0;
  const replace = (index: number, next: DraftPhoto) => {
    current = current.map((item, i) => (i === index ? next : item));
    onChange(current);
  };
  for (let index = 0; index < current.length; index += 1) {
    const photo = current[index];
    if (photo.objectPath || !photo.file) continue;
    replace(index, { ...photo, status: "uploading" });
    try {
      const objectPath = await upload(photo.file);
      replace(index, { ...photo, objectPath, status: "done" });
    } catch {
      failed += 1;
      replace(index, { ...photo, status: "error" });
    }
  }
  return { photos: current, failed };
}
