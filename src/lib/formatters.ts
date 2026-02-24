export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMins}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

const parseDateValue = (value: string | Date): Date | null => {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  let raw = value.trim();
  if (!raw) {
    return null;
  }

  // Defensively handle malformed values like "2026-02-24T16:03:02Z | risefallbot".
  if (raw.includes('|')) {
    const head = raw.split('|')[0]?.trim();
    if (head && /^\d{4}-\d{2}-\d{2}/.test(head)) {
      raw = head;
    }
  }

  // Unix timestamps as strings.
  if (/^\d{13}$/.test(raw)) {
    const parsedMs = new Date(Number(raw));
    return isNaN(parsedMs.getTime()) ? null : parsedMs;
  }
  if (/^\d{10}$/.test(raw)) {
    const parsedSec = new Date(Number(raw) * 1000);
    return isNaN(parsedSec.getTime()) ? null : parsedSec;
  }

  // PostgreSQL / logger format with optional timezone.
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}(?::\d{2})?)?$/.test(raw)) {
    let iso = raw.replace(' ', 'T');
    if (/[+-]\d{2}$/.test(iso)) {
      iso += ':00';
    }
    const sqlParsed = new Date(iso);
    if (!isNaN(sqlParsed.getTime())) {
      return sqlParsed;
    }
  }

  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) {
    return direct;
  }

  const normalized = new Date(raw.replace(' ', 'T'));
  if (!isNaN(normalized.getTime())) {
    return normalized;
  }

  return null;
};

export const formatDate = (date: string | Date): string => {
  const parsed = parseDateValue(date);
  if (!parsed) {
    if (typeof date === 'string' && date.trim()) {
      return date.trim();
    }
    return 'Unknown Time';
  }
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTimeAgo = (date: string | Date): string => {
  let parsed: Date;

  // Handle PostgreSQL format with timezone: "YYYY-MM-DD HH:MM:SS+00" or "YYYY-MM-DD HH:MM:SS+00:00"
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}[+-]\d{2}(:\d{2})?$/)) {
    let isoString = date.replace(' ', 'T');
    if (isoString.match(/[+-]\d{2}$/)) {
      isoString += ':00';
    }
    parsed = new Date(isoString);
  }
  // Handle format "YYYY-MM-DD HH:MM:SS" directly
  else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/)) {
    const isoString = date.replace(' ', 'T');
    parsed = new Date(isoString);
  } else {
    parsed = new Date(date);
  }

  if (isNaN(parsed.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return 'Just now'; // Reduced from 60s to 10s to show seconds for recent trades
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatTime = (date: string | Date): string => {
  // Handle PostgreSQL format with timezone: "YYYY-MM-DD HH:MM:SS+00" or "YYYY-MM-DD HH:MM:SS+00:00"
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}[+-]\d{2}(:\d{2})?$/)) {
    let isoString = date.replace(' ', 'T');
    if (isoString.match(/[+-]\d{2}$/)) {
      isoString += ':00';
    }
    const parsed = new Date(isoString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  }
  // Handle format "YYYY-MM-DD HH:MM:SS" directly
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/)) {
    const isoString = date.replace(' ', 'T');
    const parsed = new Date(isoString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return 'Invalid Time';
  }
  return parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
