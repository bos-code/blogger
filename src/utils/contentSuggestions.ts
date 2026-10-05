import { htmlToText, truncateText } from "./posts.ts";

const STOP_WORDS = new Set(
  "about above after again against all also always among and another any are because been before being below between both but can could did does doing down during each even every few first from further had has have having here how however into its itself just like made make many more most much must need never only other our over really same should since some such than that their them then there these they this those through too under until upon using very was way well were what when where which while who why will with within without would you your".split(
    " "
  )
);

/** First sentences of the post, trimmed to an excerpt length. */
export const suggestExcerpt = (html: string, maxLength = 180): string => {
  const text = htmlToText(html);
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let excerpt = "";
  for (const sentence of sentences) {
    if ((excerpt + sentence).length > maxLength) break;
    excerpt += sentence;
  }
  return (excerpt.trim() || truncateText(text, maxLength)).trim();
};

/** Most frequent meaningful words in the title and content. */
export const suggestTags = (title: string, html: string, count = 6): string[] => {
  const words = `${title} ${title} ${htmlToText(html)}`
    .toLowerCase()
    .match(/[a-z][a-z0-9.+#-]{2,}/g);
  if (!words) return [];
  const frequency = new Map<string, number>();
  for (const word of words) {
    const clean = word.replace(/[.-]+$/, "");
    if (clean.length < 3 || STOP_WORDS.has(clean)) continue;
    frequency.set(clean, (frequency.get(clean) ?? 0) + 1);
  }
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
};
