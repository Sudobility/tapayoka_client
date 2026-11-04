import type { NetworkClient, BaseResponse } from '@sudobility/types';
import type {
  Order,
  BuyerVerifyResponse,
  DashboardStats,
  OrderDetailed,
  QrCodeResponse,
  DeviceVerifyRequest,
  CreateOrderRequest,
  ProcessPaymentRequest,
  PiApiResponse,
  CreateAuthorizationRequest,
  TelemetryEventRequest,
  PaymentMethod,
  SetupIntentResponse,
  VendorLocation,
  VendorModel,
  VendorOffering,
  VendorDevice,
  VendorDeviceLookup,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
  VendorModelCreateRequest,
  VendorModelUpdateRequest,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorDeviceCreateRequest,
  VendorDeviceUpdateRequest,
  VendorDeviceSlot,
  VendorDeviceSlotCreateRequest,
  VendorDeviceSlotUpdateRequest,
  VendorDeviceSlotBulkCreateRequest,
  UserProfile,
  Entity,
  DeviceLog,
  DeleteResult,
  SignedData,
} from '@sudobility/tapayoka_types';
import type { FirebaseIdToken } from '../types';
import {
  buildUrl,
  createAuthHeaders,
  createHeaders,
  handleApiError,
} from '../utils/index';

export class TapayokaClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;

  constructor(config: { networkClient: NetworkClient; baseUrl: string }) {
    this.baseUrl = config.baseUrl;
    this.networkClient = config.networkClient;
  }

  private entityUrl(entitySlug: string, path: string): string {
    return buildUrl(
      this.baseUrl,
      `/api/v1/entities/${encodeURIComponent(entitySlug)}/${path}`
    );
  }

  // =========================================================================
  // User
  // =========================================================================

  async getMe(token: FirebaseIdToken): Promise<BaseResponse<UserProfile>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<UserProfile>>(
      buildUrl(this.baseUrl, '/api/v1/me'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get me');
    }
    return response.data;
  }

  async acceptTosAndCreateEntity(
    data: { displayName?: string; acceptTos: true },
    token: FirebaseIdToken
  ): Promise<BaseResponse<Entity>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Entity>>(
      buildUrl(this.baseUrl, '/api/v1/entities'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'accept TOS and create entity');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Orders & Analytics
  // =========================================================================

  async getOrders(
    entitySlug: string,
    token: FirebaseIdToken,
    limit = 50
  ): Promise<BaseResponse<OrderDetailed[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<OrderDetailed[]>
    >(this.entityUrl(entitySlug, `orders?limit=${limit}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get orders');
    }
    return response.data;
  }

  async getOrderStats(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DashboardStats>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<DashboardStats>>(
      this.entityUrl(entitySlug, 'orders/stats'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get order stats');
    }
    return response.data;
  }

  async generateQr(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<QrCodeResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<QrCodeResponse>>(
      this.entityUrl(entitySlug, `qr/${walletAddress}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'generate QR');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Devices
  // =========================================================================

  async verifyDevice(
    data: DeviceVerifyRequest,
    token?: FirebaseIdToken | null,
    tz?: string
  ): Promise<BaseResponse<BuyerVerifyResponse>> {
    const headers = token ? createAuthHeaders(token) : createHeaders();
    const url = tz
      ? buildUrl(
          this.baseUrl,
          `/api/v1/buyer/devices/verify?tz=${encodeURIComponent(tz)}`
        )
      : buildUrl(this.baseUrl, '/api/v1/buyer/devices/verify');
    const response = await this.networkClient.post<
      BaseResponse<BuyerVerifyResponse>
    >(url, data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'verify device');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Orders & Payments
  // =========================================================================

  async createOrder(
    data: CreateOrderRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Order>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/orders'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create order');
    }
    return response.data;
  }

  async getOrder(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Order>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/orders/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get order');
    }
    return response.data;
  }

  async processPayment(
    data: ProcessPaymentRequest,
    token: FirebaseIdToken
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<PiApiResponse<Order>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/orders/${data.orderId}/pay`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'process payment');
    }
    return response.data;
  }

  async cancelOrder(
    orderId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Order>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/orders/${orderId}/cancel`),
      undefined,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'cancel order');
    }
    return response.data;
  }

  // =========================================================================
  // Device provisioning
  // =========================================================================

  async getServerSetupPayload(
    token: FirebaseIdToken
  ): Promise<BaseResponse<SignedData<{ walletAddress: string }>>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<SignedData<{ walletAddress: string }>>
    >(buildUrl(this.baseUrl, '/api/v1/device-setup/server-wallet'), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get server setup payload');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Authorizations
  // =========================================================================

  async createAuthorization(
    data: CreateAuthorizationRequest,
    token: FirebaseIdToken
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<PiApiResponse<Order>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/authorizations'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create authorization');
    }
    return response.data;
  }

  async getAuthorization(
    orderId: string,
    token: FirebaseIdToken
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<PiApiResponse<Order>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/authorizations/${orderId}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get authorization');
    }
    return response.data;
  }

  async getMyOrders(token: FirebaseIdToken): Promise<BaseResponse<Order[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Order[]>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/orders'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get my orders');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Payment Methods
  // =========================================================================

  async getPaymentMethods(
    token: FirebaseIdToken
  ): Promise<BaseResponse<PaymentMethod[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<PaymentMethod[]>
    >(buildUrl(this.baseUrl, '/api/v1/buyer/payment-methods'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'list payment methods');
    }
    return response.data;
  }

  async createPaymentMethodSetupIntent(
    token: FirebaseIdToken
  ): Promise<BaseResponse<SetupIntentResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<SetupIntentResponse>
    >(
      buildUrl(this.baseUrl, '/api/v1/buyer/payment-methods/setup-intent'),
      {},
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create setup intent');
    }
    return response.data;
  }

  async deletePaymentMethod(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<null>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<BaseResponse<null>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/payment-methods/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete payment method');
    }
    return response.data;
  }

  async setDefaultPaymentMethod(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<null>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<null>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/payment-methods/${id}/default`),
      {},
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'set default payment method');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Telemetry
  // =========================================================================

  async reportTelemetry(
    data: TelemetryEventRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeviceLog>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<DeviceLog>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/telemetry'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'report telemetry');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Locations
  // =========================================================================

  async getVendorLocations(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorLocation[]>
    >(this.entityUrl(entitySlug, 'locations'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor locations');
    }
    return response.data;
  }

  async getVendorLocation(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorLocation>>(
      this.entityUrl(entitySlug, `locations/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location');
    }
    return response.data;
  }

  async createVendorLocation(
    entitySlug: string,
    data: VendorLocationCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorLocation>
    >(this.entityUrl(entitySlug, 'locations'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor location');
    }
    return response.data;
  }

  async updateVendorLocation(
    entitySlug: string,
    id: string,
    data: VendorLocationUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorLocation>>(
      this.entityUrl(entitySlug, `locations/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor location');
    }
    return response.data;
  }

  async deleteVendorLocation(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `locations/${id}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete vendor location');
    }
    return response.data;
  }

  async getVendorLocationOfferings(
    entitySlug: string,
    locationId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorOffering[]>
    >(this.entityUrl(entitySlug, `locations/${locationId}/offerings`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location offerings');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Models
  // =========================================================================

  async getVendorModels(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorModel[]>>(
      this.entityUrl(entitySlug, 'models'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor models');
    }
    return response.data;
  }

  async getVendorModel(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, `models/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor model');
    }
    return response.data;
  }

  async createVendorModel(
    entitySlug: string,
    data: VendorModelCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, 'models'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor model');
    }
    return response.data;
  }

  async updateVendorModel(
    entitySlug: string,
    id: string,
    data: VendorModelUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, `models/${id}`),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor model');
    }
    return response.data;
  }

  async deleteVendorModel(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `models/${id}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete vendor model');
    }
    return response.data;
  }

  async getVendorModelOfferings(
    entitySlug: string,
    modelId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorOffering[]>
    >(this.entityUrl(entitySlug, `models/${modelId}/offerings`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor model offerings');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Vendor Offerings
  // =========================================================================

  async getVendorOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorOffering>>(
      this.entityUrl(entitySlug, `offerings/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor offering');
    }
    return response.data;
  }

  async createVendorOffering(
    entitySlug: string,
    data: VendorOfferingCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorOffering>
    >(this.entityUrl(entitySlug, 'offerings'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor offering');
    }
    return response.data;
  }

  async updateVendorOffering(
    entitySlug: string,
    id: string,
    data: VendorOfferingUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorOffering>>(
      this.entityUrl(entitySlug, `offerings/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor offering');
    }
    return response.data;
  }

  async deleteVendorOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `offerings/${id}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete vendor offering');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Devices
  // =========================================================================

  async getVendorDevices(
    entitySlug: string,
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDevice[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorDevice[]>>(
      this.entityUrl(entitySlug, `devices/service/${serviceId}`),
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor devices');
    }
    return response.data;
  }

  /** Org-wide device list (every device in the entity), enriched with
   *  location/model/offering names for a flat list view. */
  async getAllVendorDevices(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDevice[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorDevice[]>>(
      this.entityUrl(entitySlug, 'devices'),
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get all vendor devices');
    }
    return response.data;
  }

  async lookupVendorDevice(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDeviceLookup>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorDeviceLookup>
    >(this.entityUrl(entitySlug, `devices/lookup/${walletAddress}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'look up vendor device');
    }
    return response.data;
  }

  async createVendorDevice(
    entitySlug: string,
    data: VendorDeviceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDevice>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorDevice>>(
      this.entityUrl(entitySlug, 'devices'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor device');
    }
    return response.data;
  }

  async updateVendorDevice(
    entitySlug: string,
    walletAddress: string,
    data: VendorDeviceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDevice>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorDevice>>(
      this.entityUrl(entitySlug, `devices/${walletAddress}`),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor device');
    }
    return response.data;
  }

  async deleteVendorDevice(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `devices/${walletAddress}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete vendor device');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Device Slots
  // =========================================================================

  async getVendorDeviceSlots(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDeviceSlot[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorDeviceSlot[]>
    >(this.entityUrl(entitySlug, `device-slots/device/${walletAddress}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor device slots');
    }
    return response.data;
  }

  async createVendorDeviceSlot(
    entitySlug: string,
    walletAddress: string,
    data: VendorDeviceSlotCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDeviceSlot>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorDeviceSlot>
    >(
      this.entityUrl(entitySlug, `device-slots/device/${walletAddress}`),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor device slot');
    }
    return response.data;
  }

  async bulkCreateVendorDeviceSlots(
    entitySlug: string,
    walletAddress: string,
    data: VendorDeviceSlotBulkCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDeviceSlot[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorDeviceSlot[]>
    >(
      this.entityUrl(entitySlug, `device-slots/device/${walletAddress}/bulk`),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'bulk create vendor device slots');
    }
    return response.data;
  }

  async updateVendorDeviceSlot(
    entitySlug: string,
    slotId: string,
    data: VendorDeviceSlotUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorDeviceSlot>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorDeviceSlot>
    >(this.entityUrl(entitySlug, `device-slots/${slotId}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor device slot');
    }
    return response.data;
  }

  async deleteVendorDeviceSlot(
    entitySlug: string,
    slotId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `device-slots/${slotId}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete vendor device slot');
    }
    return response.data;
  }

  async deleteAllVendorDeviceSlots(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeleteResult>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete<
      BaseResponse<DeleteResult>
    >(this.entityUrl(entitySlug, `device-slots/device/${walletAddress}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'delete all vendor device slots');
    }
    return response.data;
  }
}
