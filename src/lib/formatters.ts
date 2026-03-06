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
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}(?::\d{2})?)$/.test(raw)) {
    let iso = raw.replace(' ', 'T');
    if (/[+-]\d{2}$/.test(iso)) {
      iso += ':00';
    }
    const sqlParsed = new Date(iso);
    if (!isNaN(sqlParsed.getTime())) {
      return sqlParsed;
    }
  }

  // ISO / SQL timestamps without explicit timezone: choose the interpretation
  // closest to "now" to tolerate mixed backend timezone conventions.
  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)) {
    const naiveIso = raw.replace(' ', 'T');
    const utcParsed = new Date(`${naiveIso}Z`);
    const localParsed = new Date(naiveIso);
    const candidates = [utcParsed, localParsed].filter(
      (d) => !isNaN(d.getTime())
    );
    if (candidates.length > 0) {
      const nowMs = Date.now();
      candidates.sort(
        (a, b) =>
          Math.abs(a.getTime() - nowMs) - Math.abs(b.getTime() - nowMs)
      );
      return candidates[0];
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
  const parsed = parseDateValue(date);
  if (!parsed || isNaN(parsed.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const absDiffSecs = Math.floor(Math.abs(diffMs) / 1000);
  const absDiffMins = Math.floor(absDiffSecs / 60);
  const absDiffHours = Math.floor(absDiffMins / 60);
  const absDiffDays = Math.floor(absDiffHours / 24);

  if (diffMs < -1000) {
    if (absDiffSecs < 60) return `in ${absDiffSecs}s`;
    if (absDiffMins < 60) return `in ${absDiffMins}m`;
    if (absDiffHours < 24) return `in ${absDiffHours}h`;
    return `in ${absDiffDays}d`;
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 2) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatTime = (date: string | Date): string => {
  const parsed = parseDateValue(date);
  if (!parsed) {
    return 'Invalid Time';
  }
  return parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
