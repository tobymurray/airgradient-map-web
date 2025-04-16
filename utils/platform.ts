export const isNativeApp = (): boolean => {
  return typeof window.Capacitor !== 'undefined'
}

export const getPlatform = (): string => {
  if (isNativeApp()) {
    //@ts-ignore
    return window.Capacitor.getPlatform()
  }
  return 'web'
}
