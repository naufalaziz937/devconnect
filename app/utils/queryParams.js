export function buildQueryParams(params) {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}
