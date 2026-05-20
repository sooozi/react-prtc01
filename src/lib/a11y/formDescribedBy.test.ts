import { describe, expect, it } from "vitest";
import { formDescribedBy } from "./formDescribedBy";

describe("formDescribedBy", () => {
  it("힌트 id 하나만 넘기면 그 id를 반환한다", () => {
    expect(formDescribedBy("signup-userId-hint")).toBe("signup-userId-hint");
  });

  it("힌트와 에러 id를 공백으로 이어 반환한다", () => {
    expect(
      // eslint-disable-next-line no-constant-binary-expression
      formDescribedBy("signup-userId-hint", true && "signup-userId-error"),
    ).toBe("signup-userId-hint signup-userId-error");
  });

  it("false·null·undefined는 목록에서 빼고 이어 붙인다", () => {
    expect(
      formDescribedBy(
        "signup-userId-hint",
        false,
        null,
        undefined,
        // eslint-disable-next-line no-constant-binary-expression
        true && "signup-userId-check",
      ),
    ).toBe("signup-userId-hint signup-userId-check");
  });

  it("넘길 id가 없으면 undefined를 반환한다", () => {
    expect(formDescribedBy()).toBeUndefined();
    expect(formDescribedBy(false, null, undefined)).toBeUndefined();
  });
});
