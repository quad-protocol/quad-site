import { useEffect, useState } from "react";

export const usePeriodicCall = (callback: () => any, millis: number): void => {
  const [state, setState] = useState({
    callback: callback,
    initialized: false,
  });

  useEffect(() => {
    if (!state.initialized) {
      setState({
        callback: callback,
        initialized: true,
      });
      callback();
    }
    const interval = setInterval(callback, millis);
    return () => clearInterval(interval);
  });
};

export interface GenericLoadingHook<T> {
  loading: boolean;
  data: T | null;
}
