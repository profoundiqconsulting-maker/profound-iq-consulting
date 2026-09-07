import { describe, expect, it } from "vitest";
import {
  isQaFixtureEnabled,
  qaFixtureStorageValue,
  QA_FIXTURE_STORAGE_KEY,
} from "./qaFixture";

describe("QA fixture preference", () => {
  it("uses a single explicit storage key and opt-in value", () => {
    expect(QA_FIXTURE_STORAGE_KEY).toBe("piq-qa-fixture-enabled");
    expect(isQaFixtureEnabled("1")).toBe(true);
    expect(isQaFixtureEnabled(null)).toBe(false);
    expect(isQaFixtureEnabled("true")).toBe(false);
  });

  it("clears storage when disabled", () => {
    expect(qaFixtureStorageValue(true)).toBe("1");
    expect(qaFixtureStorageValue(false)).toBeNull();
  });
});
