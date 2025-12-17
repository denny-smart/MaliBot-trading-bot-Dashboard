// Mock data for API endpoints
export const mockActiveTrades = [
  {
    contract_id: "301907100028",
    direction: "BUY",
    stake: 10,
    entry_price: 10,
    take_profit: 2,
    stop_loss: 3,
    status: "open",
    pnl: null,
  },
];

export const mockTradeHistory = [
  {
    contract_id: "301899635408",
    direction: "SELL",
    stake: 10,
    entry_price: 10,
    take_profit: 2,
    stop_loss: 3,
    status: "open",
    pnl: 1.34,
  },
  {
    contract_id: "301896527888",
    direction: "SELL",
    stake: 10,
    entry_price: 10,
    take_profit: 2,
    stop_loss: 3,
    status: "open",
    pnl: -3.01,
  },
  {
    contract_id: "301895559668",
    direction: "SELL",
    stake: 10,
    entry_price: 10,
    take_profit: 2,
    stop_loss: 3,
    status: "open",
    pnl: 1.39,
  },
];

export const mockTradeStats = {
  total_trades: 3,
  winning_trades: 2,
  losing_trades: 1,
  win_rate: 66.66666666666666,
  total_pnl: -0.2799999999999998,
  daily_pnl: -0.2799999999999998,
};
