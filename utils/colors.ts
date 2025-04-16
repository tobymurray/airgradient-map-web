import { CHART_COLORS_DARKENED, COLORS } from '~/constants/shared/colors'
import { MapColors } from '~/types'


/**
 * Gets the color representation for PM2.5 values.
 * 
 * @param {number} pmValue - The PM2.5 value.
 * @param {boolean} [dark=false] - Whether to use dark mode colors.
 * @returns {string} The corresponding color for the PM2.5 value.
 */
export function getPM25Color(pmValue: number, dark = false): string {
  let result = MapColors.DEFAULT;

  if (pmValue <= 9) {
    result = MapColors.GREEN;
  } else if (pmValue <= 35.4) {
    result = MapColors.YELLOW;
  } else if (pmValue <= 55.4) {
    result = MapColors.ORANGE;
  } else if (pmValue <= 125.4) {
    result = MapColors.RED;
  } else if (pmValue <= 225.4) {
    result = MapColors.PURPLE;
  } else if (pmValue <= 10000) {
    result = MapColors.BROWN;
  }

  return getBGColor(result, dark);
}


/**
 * Gets the color representation for CO2 values.
 * 
 * @param {number} rco2Value - The CO2 value.
 * @param {boolean} [dark=false] - Whether to use dark mode colors.
 * @returns {string} The corresponding color for the CO2 value.
 */
export function getCO2Color(rco2Value, dark = false) {
  let color = '#7f01e2'
  const configuration = [
    { index: 1, color: MapColors.GREEN, max: 449, label: 'Excellent' },
    { index: 2, color: MapColors.YELLOW, max: 499, label: 'Good' },
    { index: 3, color: MapColors.ORANGE, max: 799, label: 'Moderate' },
    { index: 4, color: MapColors.GRAY, max: 10000, label: 'Incorrect' }
  ]

  configuration?.sort((a, b) => b.index - a.index)
  configuration?.forEach(configItem => {
    if (rco2Value <= configItem.max) {
      color = configItem.color
    }
  })

  return getBGColor(color, dark)
}


/**
 * Gets the background color based on the provided color and mode.
 * 
 * @param {Color | string} color - The color to use.
 * @param {boolean} [dark=false] - Whether to use dark mode colors.
 * @returns {string} The background color.
 */
export function getBGColor(color, dark = false) {
  if (!dark) {
    return COLORS[color] || '#166de2'
  } else {
    return CHART_COLORS_DARKENED[color] || '#0e438c'
  }
}
