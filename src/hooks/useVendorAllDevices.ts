import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { VendorDevice } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorAllDevicesReturn {
  devices: VendorDevice[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteDevice: (walletAddress: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Org-wide device list: every device across the entity's offerings, enriched
 * with location/model/offering names. Unlike {@link useVendorDevices} (scoped
 * to a single offering), this needs no serviceId — it powers the flat Devices
 * list. Creation stays offering-scoped (done via the add-device flow), so this
 * hook is read + delete only.
 */
export const useVendorAllDevices = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseVendorAllDevicesReturn => {
  const [devices, setDevices] = useState<VendorDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !entitySlug) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getAllVendorDevices(entitySlug, token);
      setDevices(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled]);

  const deleteDevice = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      if (!token || !entitySlug) return false;
      try {
        setError(null);
        await client.deleteVendorDevice(entitySlug, walletAddress, token);
        setDevices(prev => prev.filter(d => d.walletAddress !== walletAddress));
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete device';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { devices, isLoading, error, refresh, deleteDevice, clearError };
};
