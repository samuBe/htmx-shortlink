import { expect, test } from "bun:test";
import { createRateLimiter } from "./rate-limit";

test("allows up to the limit per window, per key", () => {
  const allow = createRateLimiter(2, 1000);
  expect(allow("a", 0)).toBe(true);
  expect(allow("a", 10)).toBe(true);
  expect(allow("a", 20)).toBe(false);
  expect(allow("b", 20)).toBe(true);
});

test("resets after the window", () => {
  const allow = createRateLimiter(1, 1000);
  expect(allow("a", 0)).toBe(true);
  expect(allow("a", 999)).toBe(false);
  expect(allow("a", 1000)).toBe(true);
});
