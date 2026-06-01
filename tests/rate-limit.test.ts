import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/server/rate-limit";

describe("rate limiter", () => {
  it("blocks requests after the configured limit", () => {
    const key = `test:${crypto.randomUUID()}`;

    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(false);
  });
});
