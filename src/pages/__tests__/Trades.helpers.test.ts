import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { FrontendTrade } from "@/lib/tradeTransformers";

vi.mock("lucide-react", () => ({
  ClipboardList: () => null,
  History: () => null,
  ArrowRight: () => null,
  Download: () => null,
  Search: () => null,
  Filter: () => null,
  ArrowUp: () => null,
  ArrowDown: () => null,
}));

vi.mock("@/components/ui/EmptyState", () => ({ EmptyState: () => null }));
vi.mock("@/components/ui/card", () => ({ Card: ({ children }: { children?: React.ReactNode }) => children ?? null }));
vi.mock("@/components/layout/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children?: React.ReactNode }) => children ?? null,
  TabsContent: ({ children }: { children?: React.ReactNode }) => children ?? null,
  TabsList: ({ children }: { children?: React.ReactNode }) => children ?? null,
  TabsTrigger: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));
vi.mock("@/components/ui/badge", () => ({ Badge: ({ children }: { children?: React.ReactNode }) => children ?? null }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children }: { children?: React.ReactNode }) => children ?? null }));
vi.mock("@/components/ui/input", () => ({ Input: () => null }));
vi.mock("@/components/ui/switch", () => ({ Switch: () => null }));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SelectContent: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SelectItem: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SelectValue: () => null,
}));
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));
vi.mock("@/components/ui/skeleton", () => ({ Skeleton: () => null }));
vi.mock("@/services/api", () => ({
  api: {
    trades: {
      updateExitControls: vi.fn(),
      registerManualActiveTrade: vi.fn(),
      active: vi.fn(),
      history: vi.fn(),
      stats: vi.fn(),
    },
    config: {
      current: vi.fn(),
    },
  },
}));
vi.mock("@/services/websocket", () => ({
  wsService: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));

import {
  getDisplayStatus,
  isClosedTrade,
  mergeHistoryTrades,
  normalizeTradeStatus,
} from "../Trades";

const makeTrade = (overrides: Partial<FrontendTrade> = {}): FrontendTrade => ({
  id: "t-1",
  symbol: "R_50",
  time: "2026-03-04T10:00:00Z",
  direction: "UP",
  status: "open",
  ...overrides,
});

describe("Trades page helpers", () => {
  it("derives display status from open trades with non-zero pnl", () => {
    expect(getDisplayStatus(makeTrade({ status: "open", profit: 5 }))).toBe("win");
    expect(getDisplayStatus(makeTrade({ status: "open", profit: -1 }))).toBe("loss");
    expect(getDisplayStatus(makeTrade({ status: "open", profit: 0 }))).toBe("open");
    expect(getDisplayStatus(makeTrade({ status: "closed", profit: 5 }))).toBe("closed");
  });

  it("normalizes status and preserves identity when unchanged", () => {
    const unchanged = makeTrade({ status: "loss", profit: -3 });
    expect(normalizeTradeStatus(unchanged)).toBe(unchanged);

    const changed = makeTrade({ status: "open", profit: 2 });
    const normalized = normalizeTradeStatus(changed);
    expect(normalized).not.toBe(changed);
    expect(normalized.status).toBe("win");
  });

  it("detects closed trades after display-status derivation", () => {
    expect(isClosedTrade(makeTrade({ status: "win" }))).toBe(true);
    expect(isClosedTrade(makeTrade({ status: "loss" }))).toBe(true);
    expect(isClosedTrade(makeTrade({ status: "closed" }))).toBe(true);
    expect(isClosedTrade(makeTrade({ status: "open", profit: 3 }))).toBe(true);
    expect(isClosedTrade(makeTrade({ status: "open", profit: 0 }))).toBe(false);
  });

  it("merges history by id, normalizes statuses, and sorts descending by time", () => {
    const existing = [
      makeTrade({
        id: "a",
        time: "2026-03-04T08:00:00Z",
        status: "open",
        profit: 2,
      }),
      makeTrade({
        id: "b",
        time: "2026-03-04T09:00:00Z",
        status: "loss",
        direction: "DOWN",
      }),
    ];
    const incoming = [
      makeTrade({
        id: "a",
        time: "2026-03-04T10:00:00Z",
        status: "open",
        profit: -4,
      }),
      makeTrade({
        id: "c",
        time: "2026-03-04T07:00:00Z",
        status: "closed",
      }),
    ];

    const merged = mergeHistoryTrades(existing, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(merged[0].status).toBe("loss");
  });
});
