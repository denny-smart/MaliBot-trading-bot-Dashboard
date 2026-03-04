import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatTime,
  formatTimeAgo,
} from "../formatters";

describe("formatters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats currency, percent, number and duration values", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatPercent(1.2)).toBe("+1.20%");
    expect(formatPercent(-2)).toBe("-2.00%");
    expect(formatNumber(1234567)).toBe("1,234,567");

    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(125)).toBe("2m 5s");
    expect(formatDuration(3700)).toBe("1h 1m");
    expect(formatDuration(172805)).toBe("2d 0h");
  });

  it("formats dates and handles invalid values", () => {
    expect(formatDate("")).toBe("Unknown Time");
    expect(formatDate("  invalid-time  ")).toBe("invalid-time");

    const fromPipe = formatDate("2026-02-24T16:03:02Z | risefallbot");
    expect(fromPipe).toMatch(/2026/);

    const fromUnixSec = formatDate("1704067200");
    expect(fromUnixSec).not.toBe("1704067200");
    expect(fromUnixSec).not.toBe("Unknown Time");
  });

  it("handles date objects, SQL strings, and unix milliseconds", () => {
    expect(formatDate(new Date("2026-01-01T10:00:00Z"))).toMatch(/2026/);
    expect(formatDate(new Date("invalid"))).toBe("Unknown Time");
    expect(formatDate("2026-03-04 12:00:00+00")).toMatch(/2026/);

    const fromUnixMs = formatDate("1704067200000");
    expect(fromUnixMs).not.toBe("1704067200000");
    expect(fromUnixMs).not.toBe("Unknown Time");
  });

  it("formats relative time in all ranges", () => {
    const now = new Date("2026-03-04T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(formatTimeAgo(new Date(now.getTime() - 5000).toISOString())).toBe("Just now");
    expect(formatTimeAgo(new Date(now.getTime() - 30000).toISOString())).toBe("30s ago");
    expect(formatTimeAgo(new Date(now.getTime() - 5 * 60_000).toISOString())).toBe("5m ago");
    expect(formatTimeAgo(new Date(now.getTime() - 2 * 60 * 60_000).toISOString())).toBe("2h ago");
    expect(formatTimeAgo(new Date(now.getTime() - 3 * 24 * 60 * 60_000).toISOString())).toBe("3d ago");
    expect(formatTimeAgo("not-a-date")).toBe("Invalid Date");
  });

  it("formats time and handles invalid time", () => {
    expect(formatTime("2026-02-24 16:03:02+00")).toMatch(/^\d{2}:\d{2}:\d{2}\s(AM|PM)$/);
    expect(formatTime("2026-02-24 16:03:02+00:00")).toMatch(/^\d{2}:\d{2}:\d{2}\s(AM|PM)$/);
    expect(formatTime("2026-02-24 16:03:02")).toMatch(/^\d{2}:\d{2}:\d{2}\s(AM|PM)$/);
    expect(formatTime(new Date("2026-02-24T16:03:02Z"))).toMatch(/^\d{2}:\d{2}:\d{2}\s(AM|PM)$/);
    expect(formatTime("invalid-time")).toBe("Invalid Time");
  });

  it("parses SQL-style strings in formatTimeAgo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T12:00:00.000Z"));

    expect(formatTimeAgo("2026-03-04 11:59:00+00")).toBe("1m ago");
    expect(formatTimeAgo("2026-03-04 11:58:00+00:00")).toBe("2m ago");

    const sqlNoTimezone = formatTimeAgo("2026-03-04 11:57:00");
    expect(sqlNoTimezone).not.toBe("Invalid Date");
    expect(sqlNoTimezone).toMatch(/ago$/);
  });
});
