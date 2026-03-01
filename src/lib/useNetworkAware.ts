"use client";

import { useState, useEffect } from 'react';

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

interface NetworkInformation extends EventTarget {
  readonly effectiveType: ConnectionType;
  readonly saveData: boolean;
  onchange: EventListener;
}

export function useNetworkAware() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Graceful degradation for environments where navigator or connection isn't available
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = navigator.connection as NetworkInformation;

    const checkConnection = () => {
      // If the user is on 3G or worse, or has Data Saver mode enabled
      if (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g' ||
        connection.saveData
      ) {
        setIsSlowConnection(true);
      } else {
        setIsSlowConnection(false);
      }
    };

    // Initial check
    checkConnection();

    // Listen for network changes (e.g. user goes into a tunnel)
    connection.addEventListener('change', checkConnection);

    return () => {
      connection.removeEventListener('change', checkConnection);
    };
  }, []);

  return { isSlowConnection };
}
