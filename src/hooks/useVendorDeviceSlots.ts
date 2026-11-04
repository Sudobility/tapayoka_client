import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorDeviceSlot,
  VendorDeviceSlotCreateRequest,
  VendorDeviceSlotUpdateRequest,
  VendorDeviceSlotBulkCreateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorDeviceSlotsReturn {
  slots: VendorDeviceSlot[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSlot: (
    data: VendorDeviceSlotCreateRequest
  ) => Promise<VendorDeviceSlot | null>;
  bulkCreateSlots: (
    data: VendorDeviceSlotBulkCreateRequest
  ) => Promise<VendorDeviceSlot[] | null>;
  updateSlot: (
    slotId: string,
    data: VendorDeviceSlotUpdateRequest
  ) => Promise<VendorDeviceSlot | null>;
  deleteSlot: (slotId: string) => Promise<boolean>;
  deleteAllSlots: () => Promise<boolean>;
  clearError: () => void;
}

export const useVendorDeviceSlots = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  deviceWalletAddress: string | null,
  options?: { enabled?: boolean }
): UseVendorDeviceSlotsReturn => {
  const [slots, setSlots] = useState<VendorDeviceSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled =
    options?.enabled !== false &&
    !!token &&
    !!entitySlug &&
    !!deviceWalletAddress;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !deviceWalletAddress) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorDeviceSlots(
        entitySlug!,
        deviceWalletAddress,
        token
      );
      setSlots(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, deviceWalletAddress]);

  const createSlot = useCallback(
    async (
      data: VendorDeviceSlotCreateRequest
    ): Promise<VendorDeviceSlot | null> => {
      if (!token || !deviceWalletAddress) return null;
      try {
        setError(null);
        const response = await client.createVendorDeviceSlot(
          entitySlug!,
          deviceWalletAddress,
          data,
          token
        );
        const slot = response.data ?? null;
        if (slot) setSlots(prev => [...prev, slot]);
        return slot;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug, deviceWalletAddress]
  );

  const bulkCreateSlots = useCallback(
    async (
      data: VendorDeviceSlotBulkCreateRequest
    ): Promise<VendorDeviceSlot[] | null> => {
      if (!token || !deviceWalletAddress) return null;
      try {
        setError(null);
        const response = await client.bulkCreateVendorDeviceSlots(
          entitySlug!,
          deviceWalletAddress,
          data,
          token
        );
        const newSlots = response.data ?? [];
        setSlots(newSlots);
        return newSlots;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to bulk create slots';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug, deviceWalletAddress]
  );

  const updateSlot = useCallback(
    async (
      slotId: string,
      data: VendorDeviceSlotUpdateRequest
    ): Promise<VendorDeviceSlot | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorDeviceSlot(
          entitySlug!,
          slotId,
          data,
          token
        );
        const updated = response.data ?? null;
        if (updated)
          setSlots(prev => prev.map(s => (s.id === slotId ? updated : s)));
        return updated;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const deleteSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorDeviceSlot(entitySlug!, slotId, token);
        setSlots(prev => prev.filter(s => s.id !== slotId));
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const deleteAllSlots = useCallback(async (): Promise<boolean> => {
    if (!token || !deviceWalletAddress) return false;
    try {
      setError(null);
      await client.deleteAllVendorDeviceSlots(
        entitySlug!,
        deviceWalletAddress,
        token
      );
      setSlots([]);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete all slots';
      setError(message);
      throw err;
    }
  }, [token, entitySlug, deviceWalletAddress]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    slots,
    isLoading,
    error,
    refresh,
    createSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot,
    deleteAllSlots,
    clearError,
  };
};
