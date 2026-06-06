export type SalesDateRange = 'all' | '7days' | '30days' | '90days' | 'year';

export const getSalesDateRange = (
  range: string
): { dateFrom?: string; dateTo?: string } => {
  if (range === 'all') {
    return {};
  }

  const now = new Date();
  const dateTo = now.toISOString().split('T')[0];
  let dateFrom: string;

  switch (range) {
    case '30days':
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90days':
      dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'year':
      dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    case '7days':
    default:
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
  }

  return { dateFrom, dateTo };
};
