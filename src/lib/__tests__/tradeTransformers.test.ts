import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateTradeStats,
  transformTrade,
  transformTrades,
  transformTradeStats,
} from "../tradeTransformers";

describe("tradeTransformers", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns safe defaults for invalid trade input", () => {
    const transformed = transformTrade(null as never, 7);
    expect(transformed.id).toBe("unknown-7");
    expect(transformed.symbol).toBe("Unknown");
    expect(transformed.status).toBe("open");
    expect(console.warn).toHaveBeenCalled();
  });

  it("maps backend trade fields including legacy variants and flags", () => {
    const transformed = transformTrade(
      {
        contract_id: "ctr-1",
        symbol: "R_100",
        direction: "sell",
        status: "sold",
        pnl: -5,
        stake: 10,
        strategy_name: "  trend-follow  ",
        trailing_enabled: "yes",
        stagnation_enabled: 0,
      },
      0,
    );

    expect(transformed.id).toBe("ctr-1");
    expect(transformed.direction).toBe("DOWN");
    expect(transformed.status).toBe("loss");
    expect(transformed.profit).toBe(-5);
    expect(transformed.profit_percent).toBe(-50);
    expect(transformed.strategy_type).toBe("trend-follow");
    expect(transformed.trailing_enabled).toBe(true);
    expect(transformed.stagnation_enabled).toBe(false);
  });

  it("keeps sold status as closed when pnl is missing", () => {
    const transformed = transformTrade({
      id: "legacy-1",
      signal: "BUY",
      status: "sold",
      pnl: null,
    });
    expect(transformed.status).toBe("closed");
  });

  it("maps won/lost statuses and supports alternate direction/strategy keys", () => {
    const won = transformTrade({
      id: "won-1",
      contract_type: "PUT",
      status: "won",
      strategyType: "breakout",
      trailing_enabled: 1,
      stagnation_enabled: "off",
      symbol: "R_25",
    });

    expect(won.direction).toBe("DOWN");
    expect(won.status).toBe("win");
    expect(won.strategy_type).toBe("breakout");
    expect(won.trailing_enabled).toBe(true);
    expect(won.stagnation_enabled).toBe(false);

    const lost = transformTrade({
      id: "lost-1",
      type: "buy",
      status: "loss",
      strategy: "mean-reversion",
      trailing_enabled: 2,
      stagnation_enabled: "unknown",
      symbol: "R_50",
    });

    expect(lost.direction).toBe("UP");
    expect(lost.status).toBe("loss");
    expect(lost.strategy_type).toBe("mean-reversion");
    expect(lost.trailing_enabled).toBeUndefined();
    expect(lost.stagnation_enabled).toBeUndefined();
  });

  it("uses pnl fallback for non-open statuses and handles direct trade arrays", () => {
    const transformed = transformTrade({
      id: "x-1",
      status: "completed",
      pnl: 4,
      profit: 9,
      stake: 2,
      active_strategy: "scalper",
      symbol: "R_75",
    });

    expect(transformed.status).toBe("win");
    expect(transformed.profit).toBe(4);
    expect(transformed.profit_percent).toBe(200);
    expect(transformed.strategy_type).toBe("scalper");

    const list = transformTrades([{ id: "arr-1", signal: "BUY", status: "open", symbol: "R_10" }]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("arr-1");
  });

  it("transforms arrays and wrapper objects, and handles invalid list input", () => {
    const listFromWrapper = transformTrades({
      trades: [{ id: "1", signal: "BUY", status: "open", symbol: "R_10" }],
    });
    expect(listFromWrapper).toHaveLength(1);
    expect(listFromWrapper[0].id).toBe("1");

    expect(transformTrades("bad-input" as never)).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it("maps backend stats to frontend stats", () => {
    const mapped = transformTradeStats({
      total_trades: 20,
      win_rate: 55,
      total_pnl: 120,
      avg_win: 12,
      avg_loss: -4,
      largest_win: 40,
      largest_loss: -20,
      profit_factor: 1.8,
    });

    expect(mapped).toEqual({
      total_trades: 20,
      win_rate: 55,
      total_profit: 120,
      avg_win: 12,
      avg_loss: 4,
      largest_win: 40,
      largest_loss: 20,
      avg_duration: 0,
      profit_factor: 1.8,
    });
  });

  it("maps backend stats fallback fields when total_pnl is missing", () => {
    const mapped = transformTradeStats({
      total_trades: 5,
      win_rate: 40,
      total_profit: 33,
      avg_win: 0,
      avg_loss: 0,
      largest_win: 0,
      largest_loss: 0,
      profit_factor: 0,
    });

    expect(mapped.total_profit).toBe(33);
    expect(mapped.avg_win).toBe(0);
    expect(mapped.avg_loss).toBe(0);
  });

  it("calculates aggregate trade statistics including profit factor and duration", () => {
    const stats = calculateTradeStats([
      {
        id: "w",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "UP",
        status: "win",
        profit: 10,
        duration: 60,
      },
      {
        id: "l",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "DOWN",
        status: "loss",
        profit: -5,
        duration: 120,
      },
      {
        id: "c",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "UP",
        status: "closed",
        profit: 0,
      },
      {
        id: "o",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "UP",
        status: "open",
        profit: 999,
      },
    ]);

    expect(stats.total_trades).toBe(3);
    expect(stats.win_rate).toBeCloseTo(33.33, 2);
    expect(stats.total_profit).toBe(5);
    expect(stats.avg_win).toBe(10);
    expect(stats.avg_loss).toBe(5);
    expect(stats.largest_win).toBe(10);
    expect(stats.largest_loss).toBe(5);
    expect(stats.avg_duration).toBe(90);
    expect(stats.profit_factor).toBe(2);
  });

  it("returns infinity profit factor when there are wins and no losses", () => {
    const stats = calculateTradeStats([
      {
        id: "w",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "UP",
        status: "win",
        profit: 12,
      },
    ]);

    expect(stats.profit_factor).toBe(Infinity);
  });

  it("returns zeroed stats when there are no closed trades", () => {
    const stats = calculateTradeStats([
      {
        id: "o1",
        symbol: "R_10",
        time: "2026-01-01",
        direction: "UP",
        status: "open",
      },
    ]);

    expect(stats).toEqual({
      total_trades: 0,
      win_rate: 0,
      total_profit: 0,
      avg_win: 0,
      avg_loss: 0,
      largest_win: 0,
      largest_loss: 0,
      avg_duration: 0,
      profit_factor: 0,
    });
  });
});
