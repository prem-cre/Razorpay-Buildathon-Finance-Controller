export function formatPaiseToINR(paise: number | null | undefined): string {
  if (paise === null || paise === undefined || isNaN(paise)) return '—';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatPaiseDelta(paise: number): string {
  if (paise === 0) return '₹0.00';
  const formatted = formatPaiseToINR(Math.abs(paise));
  return paise > 0 ? '+' + formatted : '-' + formatted;
}

export function formatCompactPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return '₹' + (rupees / 10000000).toFixed(2) + ' Cr';
  if (rupees >= 100000) return '₹' + (rupees / 100000).toFixed(2) + ' L';
  return formatPaiseToINR(paise);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
