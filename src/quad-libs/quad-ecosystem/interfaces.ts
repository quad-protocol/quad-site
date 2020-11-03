export interface GenericLoadingHook<T> {
  loading: boolean;
  data: T | null;
}
