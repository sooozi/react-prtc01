import { describe, expect, it } from "vitest";
import { toISODateLocal, todayISOLocal } from "./calendarUtils";

describe("toISODateLocal", () => {
  it("pads single-digit month and day with a leading zero", () => {
    expect(toISODateLocal(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("stays on the same local calendar day right before midnight, regardless of the runner's timezone", () => {
    const d = new Date(2026, 5, 20, 23, 59, 59);
    expect(toISODateLocal(d)).toBe("2026-06-20");
  });
});

describe("todayISOLocal", () => {
  it("matches toISODateLocal(new Date())", () => {
    expect(todayISOLocal()).toBe(toISODateLocal(new Date()));
  });
});
