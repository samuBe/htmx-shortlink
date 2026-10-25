// Turns user input into an absolute http(s) URL, or null if it isn't one.
// Input without a scheme ("youtube.com") is treated as https.
// Links to our own domain are rejected so short links can't point at each other.
export const normalizeUrl = (input: string, ownHost: string) => {
  const trimmed = input.trim();
  if (trimmed.length < 1) return null;

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  // Require a dot so bare words like "hello" aren't accepted as hosts
  if (!url.hostname.includes(".")) return null;

  const host = url.hostname.toLowerCase();
  const own = ownHost.toLowerCase();
  if (host === own || host.endsWith(`.${own}`)) return null;

  return url.toString();
};
