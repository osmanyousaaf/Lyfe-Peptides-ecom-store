"use client";

import { createContext, useContext } from "react";
import { SITE, type SiteSettings } from "./site";

const SiteContext = createContext<SiteSettings>(SITE);

export function SiteProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

// live store settings on the client
export function useSite(): SiteSettings {
  return useContext(SiteContext);
}
