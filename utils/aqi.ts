/**
 * Converts PM2.5 concentration to US AQI
 * Based on EPA's breakpoint table: https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf
 * 
 * @param {number} pm25 - PM2.5 concentration in μg/m³
 * @returns {number} US AQI value
 */
export function pm25ToAQI(pm25: number): number {
  // EPA breakpoint table for PM2.5
  const breakpoints = [
    { min: 0, max: 12.0, aqiMin: 0, aqiMax: 50 },
    { min: 12.1, max: 35.4, aqiMin: 51, aqiMax: 100 },
    { min: 35.5, max: 55.4, aqiMin: 101, aqiMax: 150 },
    { min: 55.5, max: 150.4, aqiMin: 151, aqiMax: 200 },
    { min: 150.5, max: 250.4, aqiMin: 201, aqiMax: 300 },
    { min: 250.5, max: 350.4, aqiMin: 301, aqiMax: 400 },
    { min: 350.5, max: 500.4, aqiMin: 401, aqiMax: 500 }
  ]

  // Find the appropriate breakpoint
  const breakpoint = breakpoints.find(bp => pm25 >= bp.min && pm25 <= bp.max)

  // If PM2.5 is higher than the highest breakpoint, use the last breakpoint
  if (!breakpoint) {
    if (pm25 > breakpoints[breakpoints.length - 1].max) {
      const bp = breakpoints[breakpoints.length - 1]
      return Math.round(((bp.aqiMax - bp.aqiMin) / (bp.max - bp.min)) * (pm25 - bp.min) + bp.aqiMin)
    }
    return 0 // For negative values
  }

  // Calculate AQI using the formula:
  // AQI = ((AQIhigh - AQIlow) / (Conchigh - Conclow)) * (Conc - Conclow) + AQIlow
  const aqi = ((breakpoint.aqiMax - breakpoint.aqiMin) / (breakpoint.max - breakpoint.min)) 
    * (pm25 - breakpoint.min) + breakpoint.aqiMin

  return Math.round(aqi)
}

/**
 * Gets the color for AQI value
 * 
 * @param {number} aqi - US AQI value
 * @returns {string} Color hex code
 */
import { AQI_COLORS } from '~/constants/shared/colors'

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return AQI_COLORS.GOOD
  if (aqi <= 100) return AQI_COLORS.MODERATE
  if (aqi <= 150) return AQI_COLORS.UNHEALTHY_SENSITIVE
  if (aqi <= 200) return AQI_COLORS.UNHEALTHY
  if (aqi <= 300) return AQI_COLORS.VERY_UNHEALTHY
  return AQI_COLORS.HAZARDOUS
} 