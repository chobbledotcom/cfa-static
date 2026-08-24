import { describe, test } from "bun:test";
import { processExternalImage } from "#media/image-external.js";
import { expectAsyncThrows } from "#test/test-utils.js";

describe("image-external", () => {
  describe("processExternalImage", () => {
    test("throws when external URL cannot be fetched", async () => {
      await expectAsyncThrows(() =>
        processExternalImage({
          src: "https://",
          alt: "Test image",
          loading: "lazy",
          classes: "featured",
          returnElement: false,
          document: null,
        }),
      );
    });
  });
});
