import { describe, expect, it } from "vitest";
import type { DraftPhoto } from "./draft";
import { uploadDraftPhotos } from "./photo-upload";

const photo = (id: string, extra: Partial<DraftPhoto> = {}): DraftPhoto => ({
  id,
  url: `blob:${id}`,
  name: `${id}.jpg`,
  file: new File(["x"], `${id}.jpg`, { type: "image/jpeg" }),
  ...extra,
});

describe("uploadDraftPhotos", () => {
  it("uploads in order, skips finished photos, and reports every status change", async () => {
    const calls: string[] = [];
    const statuses: string[] = [];
    const outcome = await uploadDraftPhotos(
      [photo("a", { objectPath: "u/a.jpg", status: "done" }), photo("b"), photo("c")],
      async (file) => {
        calls.push(file.name);
        return `u/${file.name}`;
      },
      (photos) => statuses.push(photos.map((p) => p.status ?? "-").join(",")),
    );
    expect(calls).toEqual(["b.jpg", "c.jpg"]);
    expect(outcome.failed).toBe(0);
    expect(outcome.photos.map((p) => p.objectPath)).toEqual(["u/a.jpg", "u/b.jpg", "u/c.jpg"]);
    expect(statuses).toEqual(["done,uploading,-", "done,done,-", "done,done,uploading", "done,done,done"]);
  });

  it("marks a failed photo and keeps going, so a retry resumes where it stopped", async () => {
    const outcome = await uploadDraftPhotos(
      [photo("a"), photo("b")],
      async (file) => {
        if (file.name === "a.jpg") throw new Error("offline");
        return "u/b.jpg";
      },
      () => {},
    );
    expect(outcome.failed).toBe(1);
    expect(outcome.photos.map((p) => p.status)).toEqual(["error", "done"]);
  });
});
