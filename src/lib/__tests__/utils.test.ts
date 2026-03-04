import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("utils.cn", () => {
  it("merges and de-duplicates Tailwind classes", () => {
    const result = cn("p-2", "text-red-500", "p-4");
    expect(result).toContain("text-red-500");
    expect(result).toContain("p-4");
    expect(result).not.toContain("p-2");
  });

  it("ignores falsy values", () => {
    const result = cn("font-bold", false && "hidden", undefined, null, "font-bold");
    expect(result).toContain("font-bold");
  });
});
