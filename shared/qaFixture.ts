export const QA_FIXTURE_STORAGE_KEY = "piq-qa-fixture-enabled";

export function isQaFixtureEnabled(storedValue: string | null): boolean {
  return storedValue === "1";
}

export function qaFixtureStorageValue(enabled: boolean): string | null {
  return enabled ? "1" : null;
}
