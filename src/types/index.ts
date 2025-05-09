
// OVH API 相关类型
export interface OvhConfig {
  appKey: string;
  appSecret: string;
  consumerKey: string;
  endpoint: string;
}

export interface TelegramConfig {
  token: string;
  chatId: string;
  enabled: boolean;
}

export interface TaskConfig {
  iam: string;
  zone: string;
  planCode: string;
  os: string;
  duration: string;
  options: string[];
}

export interface ServerOption {
  name: string;
  value: string;
}

export interface AvailabilityItem {
  fqn: string;
  datacenter: string;
  hardware: string;  // Add the missing hardware property
  availability: string;
}

export interface DatacenterInfo {
  datacenter: string;
  availability: string;
}

export interface AvailabilityResponse {
  fqn: string;
  datacenters: DatacenterInfo[];
}

export interface LogMessage {
  id: string;
  time: string;
  level: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

export interface TaskStatus {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  logs: LogMessage[];
  availabilities?: AvailabilityItem[];
  orderId?: string;
  orderUrl?: string;
}

export interface ServerCatalogItem {
  planCode: string;
  displayName: string;
  description?: string;
}

export interface CartResponse {
  cartId: string;
}

export interface ItemResponse {
  itemId: string;
}

export interface CheckoutResponse {
  orderId: string;
  url: string;
}
