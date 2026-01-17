/**
 * Transforms trade data from backend API format to frontend interface format
 */

export interface BackendTrade {
  contract_id: string;
  direction: 'BUY' | 'SELL';
  stake: number;
  entry_price: number;
  take_profit?: number;
  stop_loss?: number;
  status: 'open' | 'closed' | 'win' | 'loss';
  pnl: number | null;
  exit_price?: number;
  time?: string;
}

export interface FrontendTrade {
  id: string;
  time: string;
  direction: 'UP' | 'DOWN';
  entry_price?: number;
  exit_price?: number;
  stake?: number;
  profit?: number;
  profit_percent?: number;
  duration?: number;
  status: 'open' | 'win' | 'loss' | 'closed';
}

export interface BackendTradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  daily_pnl: number;
  avg_win?: number;
  avg_loss?: number;
  largest_win?: number;
  largest_loss?: number;
  profit_factor?: number;
}

export interface FrontendTradeStats {
  total_trades: number;
  win_rate: number;
  total_profit: number;
  avg_win: number;
  avg_loss: number;
  largest_win: number;
  largest_loss: number;
  avg_duration: number;
  profit_factor: number;
}

/**
 * Transforms a single backend trade to frontend format
 */
export function transformTrade(backendTrade: BackendTrade | any, index: number = 0): FrontendTrade {
  // Ensure we have valid trade data
  if (!backendTrade || typeof backendTrade !== 'object') {
    console.warn('Invalid trade data received:', backendTrade);
    return {
      id: `unknown-${index}`,
      time: new Date().toISOString(),
      direction: 'UP',
      entry_price: 0,
      stake: 0,
      status: 'open',
    };
  }

  if (index === 0) {
    console.log('First trade structure - Available fields:', Object.keys(backendTrade));
    console.log('First trade full data:', JSON.stringify(backendTrade, null, 2));
  }

  // Map direction: Backend sends 'signal' field with UP/DOWN values
  // Legacy support for: CALL/BUY -> UP, PUT/SELL -> DOWN
  let mappedDirection: 'UP' | 'DOWN' = 'UP';
  const rawDirection = String(backendTrade.signal || backendTrade.direction || backendTrade.contract_type || backendTrade.type || '').toUpperCase();

  // DEBUG: Log direction mapping
  if (index < 3) {
    console.log('=== Trade Direction Debug ===');
    console.log('Raw backend signal:', backendTrade.signal);
    console.log('Raw backend direction:', backendTrade.direction);
    console.log('Raw backend contract_type:', backendTrade.contract_type);
    console.log('Raw backend type:', backendTrade.type);
    console.log('Computed rawDirection:', rawDirection);
    console.log('Trade ID:', backendTrade.contract_id || backendTrade.id);
  }

  if (rawDirection === 'FALL' || rawDirection === 'SELL' || rawDirection === 'PUT' || rawDirection === 'DOWN') {
    mappedDirection = 'DOWN';
  }

  if (index < 3) {
    console.log('Mapped to:', mappedDirection);
    console.log('============================');
  }

  const time = backendTrade.time || backendTrade.timestamp || new Date().toISOString();

  // Map status: won -> win, lost -> loss, sold -> closed
  let status: 'open' | 'win' | 'loss' | 'closed' = 'open';
  const rawStatus = String(backendTrade.status || 'open');

  if (rawStatus === 'won' || rawStatus === 'win') {
    status = 'win';
  } else if (rawStatus === 'lost' || rawStatus === 'loss') {
    status = 'loss';
  } else if (rawStatus === 'sold') {
    // If sold, check PnL to determine win/loss, otherwise closed
    if (backendTrade.pnl !== null && backendTrade.pnl !== undefined) {
      status = backendTrade.pnl >= 0 ? 'win' : 'loss';
    } else {
      status = 'closed';
    }
  } else if (backendTrade.pnl !== null && backendTrade.pnl !== undefined && rawStatus !== 'open') {
    // Fallback if status matches none but we have PnL
    status = backendTrade.pnl >= 0 ? 'win' : 'loss';
  }

  const transformed: FrontendTrade = {
    id: backendTrade.contract_id || backendTrade.id || `trade-${index}`,
    time,
    direction: mappedDirection,
    entry_price: Number(backendTrade.entry_price) || undefined,
    exit_price: backendTrade.exit_price ? Number(backendTrade.exit_price) : undefined,
    stake: Number(backendTrade.stake) || undefined,
    profit: backendTrade.pnl !== null && backendTrade.pnl !== undefined ? Number(backendTrade.pnl) : undefined,
    profit_percent: backendTrade.pnl ? (Number(backendTrade.pnl) / Number(backendTrade.stake)) * 100 : undefined,
    duration: undefined,
    status,
  };

  return transformed;
}

/**
 * Transforms backend trades array to frontend format
 */
export function transformTrades(backendTrades: (BackendTrade | any)[] | any): FrontendTrade[] {
  // Handle case where backendTrades is an object with a trades property
  if (!Array.isArray(backendTrades) && backendTrades && typeof backendTrades === 'object' && Array.isArray(backendTrades.trades)) {
    return backendTrades.trades.map((trade: any, index: number) => transformTrade(trade, index));
  }

  // Handle case where backendTrades is not an array
  if (!Array.isArray(backendTrades)) {
    console.warn('Expected array of trades, got:', typeof backendTrades, backendTrades);
    return [];
  }

  return backendTrades.map((trade, index) => transformTrade(trade, index));
}

/**
 * Transforms backend trade stats to frontend format
 */
export function transformTradeStats(backendStats: BackendTradeStats): FrontendTradeStats {
  return {
    total_trades: backendStats.total_trades,
    win_rate: backendStats.win_rate,
    total_profit: backendStats.total_pnl,
    avg_win: backendStats.avg_win || 0,
    avg_loss: Math.abs(backendStats.avg_loss || 0),
    largest_win: backendStats.largest_win || 0,
    largest_loss: Math.abs(backendStats.largest_loss || 0),
    avg_duration: 0, // Backend doesn't provide this yet
    profit_factor: backendStats.profit_factor || 0,
  };
}

/**
 * Calculates trade statistics from a list of frontend trades
 */
export function calculateTradeStats(trades: FrontendTrade[]): FrontendTradeStats {
  const closedTrades = trades.filter(t => t.status === 'win' || t.status === 'loss' || t.status === 'closed');
  const wins = closedTrades.filter(t => t.status === 'win');
  const losses = closedTrades.filter(t => t.status === 'loss');

  const totalTrades = closedTrades.length;
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

  const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);

  // Calculate Avg Win
  const totalWinAmount = wins.reduce((sum, t) => sum + (t.profit || 0), 0);
  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;

  // Calculate Avg Loss (as positive number usually, or keep negative? UI shows red for loss)
  // The UI formatter likely handles signs, or expects positive value for "Avg Loss" if it puts a minus sign itself?
  // Looking at the original code: `avg_loss: Math.abs(avgLoss)` suggesting it wants a positive number for the magnitude.
  // And `largest_loss` also seems to be treated.
  // Let's check `Trades.tsx`:
  // <p className="text-3xl font-bold text-destructive mt-2">{formatCurrency(stats?.avg_loss || 0)}</p>
  // formatCurrency usually formats the number as is. If it's negative, it shows -. 
  // If the label is "Avg Loss", usually users expect a positive number representing the magnitude, or a negative number.
  // The previous transformer used `Math.abs(avgLoss)`. So I will return positive magnitude for Avg Loss and Largest Loss.

  const totalLossAmount = losses.reduce((sum, t) => sum + (t.profit || 0), 0); // This will be negative
  const avgLoss = losses.length > 0 ? Math.abs(totalLossAmount / losses.length) : 0;

  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.profit || 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.abs(Math.min(...losses.map(t => t.profit || 0))) : 0;

  const profitFactor = Math.abs(totalLossAmount) > 0 ? totalWinAmount / Math.abs(totalLossAmount) : (totalWinAmount > 0 ? Infinity : 0);

  // Avg Duration
  // We need duration in the trade object. Logic:
  // If trade has duration, use it. If not, and we have entry/exit times? 
  // The interface has `duration?: number`.
  const validDurations = closedTrades.filter(t => t.duration !== undefined).map(t => t.duration as number);
  const avgDuration = validDurations.length > 0
    ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length
    : 0;

  return {
    total_trades: totalTrades,
    win_rate: winRate,
    total_profit: totalProfit,
    avg_win: avgWin,
    avg_loss: avgLoss,
    largest_win: largestWin,
    largest_loss: largestLoss,
    avg_duration: avgDuration,
    profit_factor: profitFactor,
  };
}
