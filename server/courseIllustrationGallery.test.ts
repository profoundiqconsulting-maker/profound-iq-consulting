import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const gallerySource = readFileSync(new URL("../client/src/pages/MyIllustrations.tsx", import.meta.url), "utf8");

describe("My Illustrations gallery contracts", () => {
  it("keeps the folder field and protected pagination procedures in place", () => {
    expect(schemaSource).toMatch(/courseLessonIllustrationBookmarks[\s\S]*folder: varchar\("folder", \{ length: 80 \}\)\.default\("Unsorted"\)\.notNull\(\)/);
    expect(routerSource).toContain("illustrationBookmarksPage: protectedProcedure");
    expect(routerSource).toContain("updateIllustrationBookmarkFolder: protectedProcedure");
    expect(routerSource).toContain("renameIllustrationFolder: protectedProcedure");
    expect(routerSource).toContain("deleteIllustrationFolder: protectedProcedure");
    expect(routerSource).toContain("illustrationBookmarkIds: protectedProcedure");
    expect(routerSource).toContain("pageSize: z.number().int().min(6).max(48)");
  });

  it("renders scalable navigation, folder controls, and both study-sheet formats", () => {
    expect(gallerySource).toContain("illustrationBookmarksPage.useQuery");
    expect(gallerySource).toContain("Showing {((page - 1) * pageSize) + 1}");
    expect(gallerySource).toContain("Create or move to folder");
    expect(gallerySource).toContain("downloadIllustrationStudySheetPng");
    expect(gallerySource).toContain("Select all results");
    expect(gallerySource).toContain("Deselect all");
    expect(gallerySource).toContain("Clear selection");
    expect(gallerySource).toContain("renameFolder.mutate");
    expect(gallerySource).toContain("deleteFolder.mutate");
    expect(gallerySource).toContain("motion-safe:animate-[pulse_650ms_ease-out]");
    expect(gallerySource).toContain("PNG</button>");
  });
});
