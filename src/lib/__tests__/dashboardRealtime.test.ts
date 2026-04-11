import { describe, expect, it } from "vitest";
import type { FrontendBotStatus } from "@/lib/dashboardTransformers";
import { deriveClosedTradeBotStatusPatch, normalizeDashboardEvent } from "@/lib/dashboardRealtime";

const makeStatus = (overrides: Partial<FrontendBotStatus> = {}): FrontendBotStatus => ({
  status: "running",
  active_strategy: "Momentum",
  stake_amount: 10,
  uptime: 120,
  trades_today: 4,
  balance: 100,
  profit: 8,
  profit_percent: 8,
  active_positions: 1,
  win_rate: 50,
  ...overrides,
});

describe("dashboard realtime helpers", () => {
  it("normalizes unknown websocket payloads to safe records", () => {
    expect(normalizeDashboardEvent(null)).toEqual({});
    expect(normalizeDashboardEvent("bad")).toEqual({});
    expect(normalizeDashboardEvent({ balance: 150 })).toEqual({ balance: 150 });
  });

  it("uses authoritative balance and position counts from trade close events", () => {
    const patch = deriveClosedTradeBotStatusPatch({
      prevStatus: makeStatus(),
      closeEvent: {
        balance: 114,
        active_positions: 0,
      },
      tradeProfit: 14,
      wasAlreadyClosed: false,
    });

    expect(patch).toEqual({
      balance: 114,
      profit: 22,
      active_positions: 0,
    });
  });

  it("falls back to optimistic updates when the close event omits balance", () => {
    const patch = deriveClosedTradeBotStatusPatch({
      prevStatus: makeStatus(),
      closeEvent: {},
      tradeProfit: -3,
      wasAlreadyClosed: false,
    });

    expect(patch).toEqual({
      balance: 97,
      profit: 5,
      active_positions: 0,
    });
  });

  it("avoids double-applying balance and profit for duplicate close events", () => {
    const patch = deriveClosedTradeBotStatusPatch({
      prevStatus: makeStatus({ balance: 114, profit: 22, active_positions: 0 }),
      closeEvent: {},
      tradeProfit: 14,
      wasAlreadyClosed: true,
    });

    expect(patch).toEqual({
      balance: 114,
      profit: 22,
      active_positions: 0,
    });
  });
});
