/**
 * Date and numeric formatters
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return parseFloat(num).toFixed(decimals);
};
