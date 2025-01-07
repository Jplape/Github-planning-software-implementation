declare interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  timestamp?: number;
  tag?: string;
  data?: any;
}

declare interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly oldSubscription: PushSubscription | null;
  readonly newSubscription: PushSubscription | null;
}

declare interface SyncManager {
  register: (tag: string) => Promise<void>;
  getTags: () => Promise<string[]>;
}

declare interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

declare interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

declare interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: ArrayBuffer | string | null;
}

declare interface PushSubscription {
  readonly endpoint: string;
  readonly expirationTime: number | null;
  readonly options: PushSubscriptionOptions;
  getKey(name: 'p256dh'): ArrayBuffer | null;
  getKey(name: 'auth'): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

declare interface PushManager {
  subscribe(options: PushSubscriptionOptions): Promise<PushSubscription>;
  getSubscription(): Promise<PushSubscription | null>;
  permissionState(options?: PushSubscriptionOptions): Promise<'granted' | 'denied' | 'prompt'>;
}

declare interface ServiceWorkerRegistration {
  readonly pushManager: PushManager;
}

declare interface ServiceWorkerGlobalScopeEventMap {
  'push': PushEvent;
  'pushsubscriptionchange': PushSubscriptionChangeEvent;
  'notificationclick': NotificationEvent;
  'notificationclose': NotificationEvent;
}
