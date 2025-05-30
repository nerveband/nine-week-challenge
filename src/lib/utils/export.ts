export function exportToCSV(data: any, filename: string) {
  // Convert data to CSV format
  const csvContent = convertToCSV(data)
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function convertToCSV(data: any): string {
  if (!data || data.length === 0) return ''
  
  // Extract headers from the first object
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  // Convert each row
  const csvRows = data.map((row: any) => {
    return headers.map(header => {
      const value = row[header]
      // Handle special characters and quotes
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

export function generateProgressReport(progressData: {
  measurements: any[]
  dailyTracking: any[]
  meals: any[]
  treats: any[]
}) {
  const timestamp = new Date().toISOString().split('T')[0]
  
  // Create separate CSV files for each data type
  const exports = []
  
  // Daily tracking export
  if (progressData.dailyTracking.length > 0) {
    const dailyData = progressData.dailyTracking.map(day => ({
      Date: day.date,
      'Hours Sleep': day.hours_sleep || 0,
      'Ounces Water': day.ounces_water || 0,
      'Steps': day.steps || 0,
      'Daily Win': day.daily_win || '',
      'Notes': day.notes || ''
    }))
    exports.push({
      data: dailyData,
      filename: `daily-tracking-${timestamp}.csv`
    })
  }
  
  // Measurements export
  if (progressData.measurements.length > 0) {
    const measurementData = progressData.measurements.map(m => ({
      'Week Number': m.week_number,
      'Hip (inches)': m.hip || '',
      'Waist (inches)': m.waist || '',
      'Chest (inches)': m.chest || '',
      'Chest 2 (inches)': m.chest_2 || '',
      'Thigh (inches)': m.thigh || '',
      'Bicep (inches)': m.bicep || '',
      'Date': m.created_at ? new Date(m.created_at).toLocaleDateString() : ''
    }))
    exports.push({
      data: measurementData,
      filename: `measurements-${timestamp}.csv`
    })
  }
  
  // Meals export
  if (progressData.meals.length > 0) {
    const mealData = progressData.meals.map(meal => ({
      'Date': meal.daily_tracking?.date || '',
      'Meal Type': meal.meal_type,
      'Time': meal.meal_time || '',
      'Distracted': meal.distracted ? 'Yes' : 'No',
      'Ate Slowly': meal.ate_slowly ? 'Yes' : 'No',
      'Hunger Minutes': meal.hunger_minutes || '',
      'Hunger Before (1-10)': meal.hunger_before || '',
      'Fullness After (1-10)': meal.fullness_after || '',
      'Fullness Duration (minutes)': meal.duration_minutes || '',
      'Snack Reason': meal.snack_reason || '',
      'Emotion': meal.emotion || ''
    }))
    exports.push({
      data: mealData,
      filename: `meals-${timestamp}.csv`
    })
  }
  
  // Treats export
  if (progressData.treats.length > 0) {
    const treatData = progressData.treats.map(treat => ({
      'Date': treat.daily_tracking?.date || '',
      'Treat Type': treat.treat_type,
      'Quantity': treat.quantity,
      'Description': treat.description || ''
    }))
    exports.push({
      data: treatData,
      filename: `treats-${timestamp}.csv`
    })
  }
  
  // Export all files
  exports.forEach(({ data, filename }) => {
    exportToCSV(data, filename)
  })
  
  return exports.length
}