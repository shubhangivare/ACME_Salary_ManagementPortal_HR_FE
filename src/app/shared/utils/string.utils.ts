/** Shared string helpers used by feature components and services. */
export function normalizeOptionalText(value: string | null | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

export function normalizeSearchText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}
