/**
 * Transforms dashboard and bot status data from backend API format to frontend interface format
 */

export interface BackendBotStatus {
  status: 'running' | 'stopped';
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
export function transformBotStatus(backendStatus: BackendBotStatus): FrontendBotStatus {
  // Handle different possible field names from backend
  const uptime = backendStatus.uptime_seconds || backendStatus.uptime || 0;
  const profit = backendStatus.pnl || backendStatus.profit || 0;
  const profitPercent = backendStatus.pnl_percent || backendStatus.profit_percent || 0;

  return {
    status: backendStatus.status || 'stopped',
    uptime,
    trades_today: backendStatus.trades_today || 0,
    balance: backendStatus.balance || 0,
    profit,
    profit_percent: profitPercent,
    active_positions: backendStatus.active_positions || 0,
    win_rate: backendStatus.win_rate || 0,
  };
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
