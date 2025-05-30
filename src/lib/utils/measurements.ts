export function convertMeasurement(value: number, from: 'inches' | 'cm', to: 'inches' | 'cm'): number {
  if (from === to) return value
  
  if (from === 'inches' && to === 'cm') {
    return Math.round(value * 2.54 * 10) / 10 // Round to 1 decimal
  }
  
  if (from === 'cm' && to === 'inches') {
    return Math.round(value / 2.54 * 10) / 10 // Round to 1 decimal
  }
  
  return value
}

export function formatMeasurement(value: number | null | undefined, unit: 'inches' | 'cm'): string {
  if (value === null || value === undefined) return '-'
  
  if (unit === 'inches') {
    return `${value}"`
  }
  
  return `${value} cm`
}

export function getMeasurementLabel(unit: 'inches' | 'cm'): string {
  return unit === 'inches' ? 'in' : 'cm'
}

export function useMeasurementUnit(): 'inches' | 'cm' {
  // This can be enhanced to use React context or Zustand for global state
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('measurementUnit') as 'inches' | 'cm') || 'inches'
  }
  return 'inches'
}