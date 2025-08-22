"use client";
import { PropsWithChildren } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Mobile({ children }: PropsWithChildren) {
  return useIsMobile() ? <>{children}</> : null;
}
export function Desktop({ children }: PropsWithChildren) {
  return useIsMobile() ? null : <>{children}</>;
}