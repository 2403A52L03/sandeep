/**
 * CSV and Print export utilities
 */

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      let value = item[header];
      if (value === null || value === undefined) value = '';
      const stringVal = String(value).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerPrint = () => {
  window.print();
};

