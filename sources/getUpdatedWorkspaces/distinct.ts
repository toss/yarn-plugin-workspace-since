export default function distinct<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
