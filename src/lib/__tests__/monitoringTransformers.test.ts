import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  transformPerformance,
  transformSignal,
  transformSignals,
} from "../monitoringTransformers";

describe("monitoringTransformers", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("transforms a signal with condition flags and result mapping", () => {
    const signal = transformSignal(
      {
        signal: "BUY",
        score: 9,
        details: {
          close_above_sma: true,
          ema_above_sma: true,
          rsi_bullish: true,
        },
        timestamp: "2026-03-04T10:00:00Z",
        can_trade: true,
        result: "won",
      },
      0,
    );

    expect(signal.id).toBe("BUY-0-2026-03-04T10:00:00Z");
    expect(signal.signal_type).toBe("BUY");
    expect(signal.confidence).toBe(90);
    expect(signal.market_conditions).toBe("Close > SMA, EMA > SMA, RSI Bullish");
    expect(signal.action_taken).toBe("Trade Executed");
    expect(signal.result).toBe("Won");
  });

  it("handles skipped and capped confidence cases", () => {
    const signal = transformSignal(
      {
        signal: "SELL",
        score: 25,
        details: {},
        timestamp: "2026-03-04T11:00:00Z",
        can_trade: false,
      },
      3,
    );

    expect(signal.confidence).toBe(100);
    expect(signal.market_conditions).toBe("Neutral");
    expect(signal.action_taken).toBe("Pending");
    expect(signal.result).toBe("Skipped");
  });

  it("maps lost and passthrough result values", () => {
    const lost = transformSignal(
      {
        signal: "SELL",
        score: 7,
        details: {
          close_below_sma: true,
          ema_below_sma: true,
          rsi_bearish: true,
          strong_trend: true,
          consecutive_momentum: true,
        },
        timestamp: "2026-03-04T11:10:00Z",
        can_trade: true,
        result: "lost",
      },
      1,
    );

    expect(lost.result).toBe("Lost");
    expect(lost.market_conditions).toContain("Close < SMA");
    expect(lost.market_conditions).toContain("EMA < SMA");
    expect(lost.market_conditions).toContain("RSI Bearish");
    expect(lost.market_conditions).toContain("Strong Trend");
    expect(lost.market_conditions).toContain("Momentum");

    const passthrough = transformSignal(
      {
        signal: "BUY",
        score: 6,
        details: {},
        timestamp: "2026-03-04T11:20:00Z",
        can_trade: true,
        result: "breakeven",
      },
      2,
    );

    expect(passthrough.result).toBe("breakeven");
  });

  it("prefers backend action_taken when provided", () => {
    const signal = transformSignal(
      {
        signal: "UP",
        score: 8,
        details: {},
        timestamp: "2026-03-04T12:00:00Z",
        can_trade: true,
        action_taken: "Awaiting Manual Entry",
      },
      4,
    );

    expect(signal.action_taken).toBe("Awaiting Manual Entry");
  });

  it("transforms signal arrays", () => {
    const transformed = transformSignals([
      {
        signal: "BUY",
        score: 4,
        details: {},
        timestamp: "2026-03-04T08:00:00Z",
        can_trade: true,
      },
      {
        signal: "SELL",
        score: 5,
        details: {},
        timestamp: "2026-03-04T08:05:00Z",
        can_trade: false,
      },
    ]);

    expect(transformed).toHaveLength(2);
    expect(transformed[0].id).toContain("BUY-0");
    expect(transformed[1].id).toContain("SELL-1");
  });

  it("uses explicit performance fields when available", () => {
    const transformed = transformPerformance({
      uptime: "2h 0m",
      cpu_usage: "40",
      memory_usage: 50,
      active_connections: "7",
      error_rate: "1.5",
      request_success_rate: "98.5",
    });

    expect(transformed).toEqual({
      uptime: "2h 0m",
      cpu_usage: 40,
      memory_usage: 50,
      active_connections: 7,
      error_rate: 1.5,
      request_success_rate: 98.5,
    });
  });

  it("derives fallback performance values from backend summary fields", () => {
    const transformed = transformPerformance({
      uptime_seconds: 3661,
      win_rate: 80,
      cycles_completed: 11,
      total_trades: 9,
    });

    expect(transformed.uptime).toBe("1h 1m");
    expect(transformed.cpu_usage).toBe(45);
    expect(transformed.memory_usage).toBe(46);
    expect(transformed.active_connections).toBe(9);
    expect(transformed.error_rate).toBe(1);
    expect(transformed.request_success_rate).toBe(98);
  });

  it("formats uptime for day, minute, and second ranges", () => {
    expect(transformPerformance({ uptime_seconds: 90_061 }).uptime).toBe("1d 1h 1m");
    expect(transformPerformance({ uptime_seconds: 125 }).uptime).toBe("2m 5s");
    expect(transformPerformance({ uptime_seconds: 59 }).uptime).toBe("59s");
    expect(transformPerformance({ uptime_seconds: 0 }).uptime).toBe("0h 0m");
  });

  it("uses numeric uptime fallback field when uptime_seconds is missing", () => {
    const transformed = transformPerformance({ uptime: 7200 });
    expect(transformed.uptime).toBe("2h 0m");
  });
});
