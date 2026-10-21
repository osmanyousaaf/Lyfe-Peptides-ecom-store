// Server-side shaping of analytics rows for client components (keeps the geo database off the client).
import { flag, placeLabel, regionName, countryName } from "./geo";
import { live, type Live } from "./analytics";

export type LiveRow = { path: string; place: string; flag: string; device: string; secondsAgo: number };
export type LiveData = { count: number; viewsLast30m: number; pages: { label: string; value: number }[]; visitors: LiveRow[] };

export function liveData(): LiveData {
  const l: Live = live();
  return {
    count: l.count,
    viewsLast30m: l.viewsLast30m,
    pages: l.pages.map((p) => ({ label: p.label, value: p.value })),
    visitors: l.visitors.map((v) => ({
      path: v.path,
      place: placeLabel(v),
      flag: flag(v.country),
      device: v.device,
      secondsAgo: Math.max(0, v.secondsAgo),
    })),
  };
}

export { flag, placeLabel, regionName, countryName };
