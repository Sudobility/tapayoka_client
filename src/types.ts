export type FirebaseIdToken = string;

export const QUERY_KEYS = {
  ORDERS: 'tapayoka-orders',
  ORDER: 'tapayoka-order',
  AUTHORIZATIONS: 'tapayoka-authorizations',
  BUYER_DEVICES: 'tapayoka-buyer-devices',
  ANALYTICS: 'tapayoka-analytics',
  QR: 'tapayoka-qr',
  ENTITIES: 'tapayoka-entities',
  ME: 'tapayoka-me',
  VENDOR_LOCATIONS: 'tapayoka-vendor-locations',
  VENDOR_LOCATION: 'tapayoka-vendor-location',
  VENDOR_MODELS: 'tapayoka-vendor-models',
  VENDOR_MODEL: 'tapayoka-vendor-model',
  VENDOR_OFFERINGS: 'tapayoka-vendor-offerings',
  VENDOR_OFFERING: 'tapayoka-vendor-offering',
  VENDOR_DEVICES: 'tapayoka-vendor-devices',
} as const;
