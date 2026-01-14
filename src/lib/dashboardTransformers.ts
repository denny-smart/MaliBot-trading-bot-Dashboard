/**
 * Transforms dashboard and bot status data from backend API format to frontend interface format
 */

export interface BackendBotStatus {
  status: 'running' | 'stopped';
  active_strategy?: string;
  stake_amount?: number;
  uptime_seconds?: number;
  uptime?: number;
  trades_today?: number;
  balance?: number;
  profit?: number;
  profit_percent?: number;
  pnl?: number;
  pnl_percent?: number;
  active_positions?: number;
  win_rate?: number;
}

export interface FrontendBotStatus {
  status: 'running' | 'stopped';
  active_strategy: string;
  stake_amount: number;
  uptime: number;
  trades_today: number;
  balance: number;
  profit: number;
  profit_percent: number;
  active_positions: number;
  win_rate: number;
}

/**
 * Transforms backend bot status to frontend format
 */
export function transformBotStatus(backendStatus: BackendBotStatus | any): FrontendBotStatus {
  // Ensure we have valid data to work with
  if (!backendStatus || typeof backendStatus !== 'object') {
    console.warn('Invalid bot status data received:', backendStatus);
    return {
      status: 'stopped',
      active_strategy: 'Unknown',
      stake_amount: 0,
      uptime: 0,
      trades_today: 0,
      balance: 0,
      profit: 0,
      profit_percent: 0,
      active_positions: 0,
      win_rate: 0,
    };
  }

  console.log('Full bot status object:', backendStatus);

  // Extract statistics if available
  const stats = backendStatus.statistics || {};
  console.log('Statistics object:', stats);

  // Handle different possible field names from backend
  // Status fields
  const uptime = backendStatus.uptime_seconds ?? backendStatus.uptime ?? 0;
  const activeStrategy = backendStatus.active_strategy ?? 'Conservative';
  const stakeAmount = backendStatus.stake_amount ?? 0;

  // Trades/Stats fields (from statistics object or top level)
  const tradesCount = stats.total_trades ?? backendStatus.total_trades ?? backendStatus.trades_today ?? 0;
  const profit = stats.total_pnl ?? stats.daily_pnl ?? backendStatus.pnl ?? backendStatus.profit ?? 0;
  const rate = stats.win_rate ?? backendStatus.win_rate ?? backendStatus.winrate ?? 0;

  // Optional fields with defaults
  const accountBalance = backendStatus.balance ?? backendStatus.account_balance ?? 0;
  const activePos = backendStatus.active_positions ?? backendStatus.open_positions ?? 0;
  const profitPercent = backendStatus.pnl_percent ?? backendStatus.profit_percent ?? (profit && accountBalance ? (profit / accountBalance) * 100 : 0);

  const transformed: FrontendBotStatus = {
    status: backendStatus.status || 'stopped',
    active_strategy: activeStrategy,
    stake_amount: Number(stakeAmount) || 0,
    uptime: Number(uptime) || 0,
    trades_today: Number(tradesCount) || 0,
    balance: Number(accountBalance) || 0,
    profit: Number(profit) || 0,
    profit_percent: Number(profitPercent) || 0,
    active_positions: Number(activePos) || 0,
    win_rate: Number(rate) || 0,
  };

  console.log('Transformed bot status:', transformed);
  return transformed;
}

/**
 * Generates profit chart data based on total PnL
 * Distributes the profit across 24-hour periods with realistic variations
 */
export function generateProfitChartData(
  totalProfit: number,
  tradesToday: number
): { time: string; profit: number }[] {
  const data: { time: string; profit: number }[] = [];
  let cumulativeProfit = 0;
  const avgTradePerHour = tradesToday / 24;

  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0');

    // Generate variation based on trading activity
    const hourlyTrades = avgTradePerHour + (Math.random() - 0.5) * 2;
    const hourlyProfit = (totalProfit / 24) * (1 + Math.random() * 0.5 - 0.25);

    cumulativeProfit += hourlyProfit;

    data.push({
      time: `${hour}:00`,
      profit: Math.round(cumulativeProfit * 100) / 100,
    });
  }

  return data;
}

export interface FrontendTradeStats {
  total_trades: number;
  verified_trades: number;
  win_rate: number;
  profit_factor: number;
  total_profit: number;
  daily_average: number;
  best_trade: number;
  worst_trade: number;
}

/**
 * Transforms backend trade statistics to frontend format
 */
export function transformTradeStats(data: any): FrontendTradeStats {
  if (!data || typeof data !== 'object') {
    return {
      total_trades: 0,
      verified_trades: 0,
      win_rate: 0,
      profit_factor: 0,
      total_profit: 0,
      daily_average: 0,
      best_trade: 0,
      worst_trade: 0,
    };
  }

  return {
    total_trades: Number(data.total_trades) || 0,
    verified_trades: Number(data.verified_trades) || 0,
    win_rate: Number(data.win_rate) || 0,
    profit_factor: Number(data.profit_factor) || 0,
    total_profit: Number(data.total_profit) || 0,
    daily_average: Number(data.daily_average) || 0,
    best_trade: Number(data.best_trade) || 0,
    worst_trade: Number(data.worst_trade) || 0,
  };
}
