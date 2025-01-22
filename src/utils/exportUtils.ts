import { databaseService } from '@/services/DatabaseService';

export async function downloadCSV(type: 'daily' | 'weekly' | 'measurements'): Promise<void> {
  try {
    const csvContent = await databaseService.exportToCSV(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `9-week-challenge-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw new Error('Failed to download CSV file');
  }
} 