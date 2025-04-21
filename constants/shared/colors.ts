import { MapColors } from '~/types/shared/colors'

export { MapColors } from '~/types/shared/colors'

// Base color palette
export const COLORS: Record<MapColors, string> = {
  // PM2.5 Colors
  [MapColors.GREEN]: '#1de208',
  [MapColors.YELLOW]: '#e2e020',
  [MapColors.ORANGE]: '#e26a05',
  [MapColors.RED]: '#e20410',
  [MapColors.PURPLE]: '#7f01e2',
  [MapColors.BROWN]: '#903305',
  [MapColors.BLUE]: '#166de2',
  [MapColors.GRAY]: '#d1d3d5',
  [MapColors.LIGHTGRAY]: '#e7e9eb',
  [MapColors.DEFAULT]: '#d1d3d5',
  
  // Text Colors
  [MapColors.TEXT_DARK]: '#2c3e50',
  [MapColors.TEXT_LIGHT]: '#ffffff',
  
  // UI Colors
  [MapColors.PRIMARY]: '#1c75bc',
  [MapColors.SECONDARY]: '#fc7e10',
  [MapColors.BORDER]: 'rgba(0, 0, 0, 0.2)',
  [MapColors.SHADOW]: 'rgba(0, 0, 0, 0.1)',
  [MapColors.SHADOW_DARKER]: 'rgba(0, 0, 0, 0.2)'
};

export const CHART_COLORS_DARKENED: Record<MapColors, string> = {
  // PM2.5 Colors
  [MapColors.GREEN]: '#2b9b20',
  [MapColors.YELLOW]: '#c7ac1d',
  [MapColors.ORANGE]: '#b94f04',
  [MapColors.RED]: '#881218',
  [MapColors.PURPLE]: '#521681',
  [MapColors.BROWN]: '#54230b',
  [MapColors.BLUE]: '#134f7e',
  [MapColors.GRAY]: '#4c5660',
  [MapColors.LIGHTGRAY]: '#919497',
  [MapColors.DEFAULT]: '#4c5660',
  
  // Text Colors
  [MapColors.TEXT_DARK]: '#1a2733',
  [MapColors.TEXT_LIGHT]: '#cccccc',
  
  // UI Colors
  [MapColors.PRIMARY]: '#155c96',
  [MapColors.SECONDARY]: '#cc660d',
  [MapColors.BORDER]: 'rgba(0, 0, 0, 0.3)',
  [MapColors.SHADOW]: 'rgba(0, 0, 0, 0.2)',
  [MapColors.SHADOW_DARKER]: 'rgba(0, 0, 0, 0.3)'
};

// AQI-specific colors (used only in getAQIColor)
export const AQI_COLORS = {
  GOOD: '#00e400',
  MODERATE: '#ffff00',
  UNHEALTHY_SENSITIVE: '#ff7e00',
  UNHEALTHY: '#ff0000',
  VERY_UNHEALTHY: '#8f3f97',
  HAZARDOUS: '#7e0023'
} as const;