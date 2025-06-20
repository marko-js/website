export function ok(v, m) {
  if (!v) throw new Error(m || "Assertion failed");
}
export default { ok };
