import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm');
  } catch {
    return '';
  }
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'LOW': return 'badge-low';
    case 'MEDIUM': return 'badge-medium';
    case 'HIGH': return 'badge-high';
    case 'CRITICAL': return 'badge-critical';
    default: return 'badge-medium';
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'PENDING_VERIFICATION': return 'badge-pending';
    case 'VERIFIED': return 'badge-verified';
    case 'IN_PROGRESS': return 'badge-progress';
    case 'RESOLVED': return 'badge-resolved';
    case 'REJECTED': return 'badge-rejected';
    default: return '';
  }
}

export function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export function getLevelProgress(score: number): { level: string; progress: number; next: number } {
  const thresholds = [
    { level: 'NEWCOMER', min: 0, max: 100 },
    { level: 'OBSERVER', min: 101, max: 500 },
    { level: 'REPORTER', min: 501, max: 1500 },
    { level: 'GUARDIAN', min: 1501, max: 3000 },
    { level: 'ECO_CHAMPION', min: 3001, max: 9999 },
  ];
  for (const t of thresholds) {
    if (score <= t.max) {
      const progress = ((score - t.min) / (t.max - t.min)) * 100;
      return { level: t.level, progress: Math.max(0, Math.min(100, progress)), next: t.max };
    }
  }
  return { level: 'ECO_CHAMPION', progress: 100, next: 9999 };
}
