import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateProfitChartData,
  transformBotStatus,
  transformTradeStats,
} from "../dashboardTransformers";

describe("dashboardTransformers", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns defaults for invalid bot status payloads", () => {
    expect(transformBotStatus(null as never)).toEqual({
      status: "stopped",
      active_strategy: "Unknown",
      stake_amount: 0,
      uptime: 0,
      trades_today: 0,
      balance: 0,
      profit: 0,
      profit_percent: 0,
      active_positions: 0,
      win_rate: 0,
    });
  });

  it("transforms a populated bot status payload", () => {
    const transformed = transformBotStatus({
      status: "running",
      active_strategy: "Trend",
      stake_amount: "12.5",
      uptime_seconds: "3600",
      statistics: {
        total_trades: 7,
        total_pnl: 14,
        win_rate: 60,
      },
      balance: 140,
      active_positions: "2",
    });

    expect(transformed).toEqual({
      status: "running",
      active_strategy: "Trend",
      stake_amount: 12.5,
      uptime: 3600,
      trades_today: 7,
      balance: 140,
      profit: 14,
      profit_percent: 10,
      active_positions: 2,
      win_rate: 60,
    });
  });

  it("uses fallback backend fields when statistics are missing", () => {
    const transformed = transformBotStatus({
      status: "",
      uptime: 120,
      total_trades: 5,
      pnl: -2,
      winrate: 44,
      account_balance: 200,
      open_positions: 3,
      pnl_percent: -1,
    });

    expect(transformed).toEqual({
      status: "stopped",
      active_strategy: "Unknown",
      stake_amount: 0,
      uptime: 120,
      trades_today: 5,
      balance: 200,
      profit: -2,
      profit_percent: -1,
      active_positions: 3,
      win_rate: 44,
    });
  });

  it("uses nested and tertiary fallbacks for trade count/profit fields", () => {
    const transformed = transformBotStatus({
      status: "running",
      trades_today: 6,
      win_rate: 52,
      profit_percent: 7.5,
      statistics: {
        daily_pnl: 8,
      },
    });

    expect(transformed.trades_today).toBe(6);
    expect(transformed.profit).toBe(8);
    expect(transformed.win_rate).toBe(52);
    expect(transformed.profit_percent).toBe(7.5);
  });

  it("generates 24-point profit chart data", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const chart = generateProfitChartData(240, 24);

    expect(chart).toHaveLength(24);
    expect(chart[0]).toEqual({ time: "00:00", profit: 10 });
    expect(chart[23]).toEqual({ time: "23:00", profit: 240 });
  });

  it("maps trade stats and handles invalid payload", () => {
    expect(transformTradeStats(undefined)).toEqual({
      total_trades: 0,
      verified_trades: 0,
      win_rate: 0,
      profit_factor: 0,
      total_profit: 0,
      daily_average: 0,
      best_trade: 0,
      worst_trade: 0,
    });

    expect(
      transformTradeStats({
        total_trades: "30",
        verified_trades: "25",
        win_rate: "63.5",
        profit_factor: "1.9",
        total_profit: "145.2",
        daily_average: "12.1",
        best_trade: "40",
        worst_trade: "-16",
      }),
    ).toEqual({
      total_trades: 30,
      verified_trades: 25,
      win_rate: 63.5,
      profit_factor: 1.9,
      total_profit: 145.2,
      daily_average: 12.1,
      best_trade: 40,
      worst_trade: -16,
    });
  });

  it("coerces invalid numeric values in trade stats to zero", () => {
    expect(
      transformTradeStats({
        total_trades: "x",
        verified_trades: null,
        win_rate: undefined,
        profit_factor: "bad",
        total_profit: "",
        daily_average: "NaN",
        best_trade: {},
        worst_trade: [],
      }),
    ).toEqual({
      total_trades: 0,
      verified_trades: 0,
      win_rate: 0,
      profit_factor: 0,
      total_profit: 0,
      daily_average: 0,
      best_trade: 0,
      worst_trade: 0,
    });
  });
});
