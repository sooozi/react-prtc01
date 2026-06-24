import { describe, expect, it } from "vitest";
import { quillModules, quillResizeModuleConfig } from "./quillConfig";

describe("quillResizeModuleConfig", () => {
  it("enables DisplaySize and Resize submodules", () => {
    expect(quillResizeModuleConfig.modules).toEqual(["DisplaySize", "Resize"]);
  });

  it("limits resize to images with a minimum width", () => {
    expect(quillResizeModuleConfig.embedTags).toEqual([]);
    expect(quillResizeModuleConfig.parchment?.image?.attribute).toContain("width");
    expect(quillResizeModuleConfig.parchment?.image?.limit?.minWidth).toBe(80);
  });
});

describe("quillModules", () => {
  it("keeps the image toolbar button and wires the resize module", () => {
    const toolbar = quillModules.toolbar as unknown[];
    const flatToolbar = toolbar.flat(Infinity);

    expect(flatToolbar).toContain("image");
    expect(quillModules.resize).toBe(quillResizeModuleConfig);
  });
});
