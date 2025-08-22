"use client";
import { useSyncExternalStore } from "react";

const MOBILE = 768;

export function useIsMobile() {
  const subscribe = (cb: () => void) => {
    const mql = window.matchMedia(`(max-width:${MOBILE - 1}px)`);
    // @ts-ignore older Safari
    const add = mql.addEventListener ? mql.addEventListener.bind(mql, "change") : mql.addListener.bind(mql);
    // @ts-ignore older Safari
    const rm  = mql.removeEventListener ? mql.removeEventListener.bind(mql, "change") : mql.removeListener.bind(mql);
    add(cb);
    return () => rm(cb);
  };
  const get = () => window.innerWidth < MOBILE;
  const getServer = () => false; // tránh hydrate mismatch
  return useSyncExternalStore(subscribe, get, getServer);
}