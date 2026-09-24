export default function copy(value: string): boolean {
  void navigator.clipboard.writeText(value);
  return true;
}
