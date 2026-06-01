import { describe, expect, it } from "vitest";
import { getPagination, getTotalPages, parsePositiveInt } from "@/lib/pagination";

describe("pagination helpers", () => {
  it("falls back when values are invalid", () => {
    expect(parsePositiveInt("abc", 3)).toBe(3);
    expect(parsePositiveInt("-1", 3)).toBe(3);
    expect(parsePositiveInt("4", 3)).toBe(4);
  });

  it("clamps page size and calculates skip/take", () => {
    expect(getPagination({ page: "3", pageSize: "100" }, 20)).toEqual({
      page: 3,
      pageSize: 20,
      skip: 40,
      take: 20
    });
  });

  it("returns at least one total page", () => {
    expect(getTotalPages(0, 10)).toBe(1);
    expect(getTotalPages(41, 10)).toBe(5);
  });
});
