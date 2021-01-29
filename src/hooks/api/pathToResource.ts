export default function (path: string): string {
  const path_parts = path.split('/')
  if (path_parts.length > 0) {
    return path_parts[0]
  } else {
    return path
  }
}
