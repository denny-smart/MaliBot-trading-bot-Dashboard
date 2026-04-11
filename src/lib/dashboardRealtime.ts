import type { FrontendBotStatus } from './dashboardTransformers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getNumericValue = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return undefined;
};

export const normalizeDashboardEvent = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {};

export const deriveClosedTradeBotStatusPatch = ({
  prevStatus,
  closeEvent,
  tradeProfit,
  wasAlreadyClosed,
}: {
  prevStatus: FrontendBotStatus;
  closeEvent: Record<string, unknown>;
  tradeProfit: number;
  wasAlreadyClosed: boolean;
}): Pick<FrontendBotStatus, 'balance' | 'profit' | 'active_positions'> => {
  const statistics = isRecord(closeEvent.statistics) ? closeEvent.statistics : {};
  const nextBalance = getNumericValue(
    closeEvent.balance,
    closeEvent.account_balance,
    statistics.balance,
    statistics.account_balance,
  );
  const nextActivePositions = getNumericValue(
    closeEvent.active_positions,
    closeEvent.open_positions,
    statistics.active_positions,
    statistics.open_positions,
  );

  return {
    balance: nextBalance ?? (wasAlreadyClosed ? prevStatus.balance : prevStatus.balance + tradeProfit),
    profit: wasAlreadyClosed ? prevStatus.profit : prevStatus.profit + tradeProfit,
    active_positions: nextActivePositions ?? (wasAlreadyClosed
      ? prevStatus.active_positions
      : Math.max(0, prevStatus.active_positions - 1)),
  };
};
