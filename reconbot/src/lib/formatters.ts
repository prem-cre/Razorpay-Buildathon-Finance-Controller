export function formatTruncatedId(id: string, prefixLen = 6, suffixLen = 4): string {
  if (!id || id.length <= prefixLen + suffixLen) return id;
  return id.slice(0, prefixLen) + '...' + id.slice(-suffixLen);
}

export function formatPercentage(val: number, decimals = 1): string {
  return val.toFixed(decimals) + '%';
}

export function formatDate(isoStr: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
}

export function formatDateTime(isoStr: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return datePart + ', ' + timePart;
  } catch {
    return isoStr;
  }
}
