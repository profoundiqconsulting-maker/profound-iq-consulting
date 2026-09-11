export function localizeCourseMetadata(
  _locale: string,
  _slug: string,
  title: string,
  description: string
): { title: string; description: string } {
  return { title, description };
}