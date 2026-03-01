/**
 * Securely triggers mobile device haptic feedback if supported.
 * Does not throw errors on unsupported devices (e.g. iOS Safari or desktop).
 * 
 * @param type 'light' | 'medium' | 'heavy'
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10); // A tiny, sharp tap
        break;
      case 'medium':
        navigator.vibrate(20); // A standard tap
        break;
      case 'heavy':
        navigator.vibrate([30, 50, 30]); // A double heavy thud (e.g., error or big success)
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (error) {
    // Silently fail if browser blocks it (common in some power saving modes or webviews)
    console.debug('Haptics not supported or blocked');
  }
};
