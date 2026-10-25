import { describe, expect, test } from "bun:test";
import { normalizeUrl } from "./url";

const own = "t.sambe.uk";

describe("normalizeUrl", () => {
  test.each([
    ["youtube.com", "https://youtube.com/"],
    ["www.youtube.com", "https://www.youtube.com/"],
    ["  https://youtube.com  ", "https://youtube.com/"],
    [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
    ],
    ["https://www.youtube.com/@MrBeast", "https://www.youtube.com/@MrBeast"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "https://youtu.be/dQw4w9WgXcQ?si=abc"],
    [
      "https://en.wikipedia.org/wiki/Foo_(bar)",
      "https://en.wikipedia.org/wiki/Foo_(bar)",
    ],
    ["https://example.com/search?q=a/b", "https://example.com/search?q=a/b"],
    ["https://example.com/a,b", "https://example.com/a,b"],
    ["HTTP://EXAMPLE.com/Path", "http://example.com/Path"],
    ["http://192.168.1.1:8080/x", "http://192.168.1.1:8080/x"],
    // Not our domain, it only starts with it
    ["https://t.sambe.uk.example.com", "https://t.sambe.uk.example.com/"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeUrl(input, own)).toBe(expected);
  });

  test.each([
    "",
    "   ",
    "hello",
    "javascript:alert(1)",
    "ftp://example.com",
    "https://",
    "https://t.sambe.uk/abc",
    "t.sambe.uk/abc",
    "https://www.t.sambe.uk",
  ])("rejects %p", (input) => {
    expect(normalizeUrl(input, own)).toBeNull();
  });
});
