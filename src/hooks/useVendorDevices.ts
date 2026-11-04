import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorDevice,
  VendorDeviceLookup,
  VendorDeviceCreateRequest,
  VendorDeviceUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorDevicesReturn {
  devices: VendorDevice[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDevice: (
    data: VendorDeviceCreateRequest
  ) => Promise<VendorDevice | null>;
  updateDevice: (
    walletAddress: string,
    data: VendorDeviceUpdateRequest
  ) => Promise<VendorDevice | null>;
  deleteDevice: (walletAddress: string) => Promise<boolean>;
  lookupDevice: (walletAddress: string) => Promise<VendorDeviceLookup | null>;
  clearError: () => void;
}

export const useVendorDevices = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  serviceId: string | null,
  options?: { enabled?: boolean }
): UseVendorDevicesReturn => {
  const [devices, setDevices] = useState<VendorDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled =
    options?.enabled !== false && !!token && !!entitySlug && !!serviceId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !serviceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorDevices(
        entitySlug!,
        serviceId,
        token
      );
      setDevices(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, serviceId]);

  const createDevice = useCallback(
    async (data: VendorDeviceCreateRequest): Promise<VendorDevice | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorDevice(
          entitySlug!,
          data,
          token
        );
        const device = response.data ?? null;
        if (device) setDevices(prev => [...prev, device]);
        return device;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create device';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const updateDevice = useCallback(
    async (
      walletAddress: string,
      data: VendorDeviceUpdateRequest
    ): Promise<VendorDevice | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorDevice(
          entitySlug!,
          walletAddress,
          data,
          token
        );
        const updated = response.data ?? null;
        if (updated)
          setDevices(prev =>
            prev.map(e => (e.walletAddress === walletAddress ? updated : e))
          );
        return updated;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update device';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const deleteDevice = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorDevice(entitySlug!, walletAddress, token);
        setDevices(prev => prev.filter(e => e.walletAddress !== walletAddress));
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

  const lookupDevice = useCallback(
    async (walletAddress: string): Promise<VendorDeviceLookup | null> => {
      // Imperative one-shot check; independent of the list's enabled-gating
      // (callers may not have a serviceId), only needs token + entitySlug.
      if (!token || !entitySlug) return null;
      try {
        setError(null);
        const response = await client.lookupVendorDevice(
          entitySlug,
          walletAddress,
          token
        );
        return response.data ?? null;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to look up device';
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

  return {
    devices,
    isLoading,
    error,
    refresh,
    createDevice,
    updateDevice,
    deleteDevice,
    lookupDevice,
    clearError,
  };
};
