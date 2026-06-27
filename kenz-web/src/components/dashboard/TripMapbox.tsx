"use client";

/**
 * Smart map router — uses Google Maps when NEXT_PUBLIC_GOOGLE_PLACES_KEY is set,
 * falls back to MapLibre GL JS (free, no key required) otherwise.
 * All dashboard components import this file; no other files need updating.
 */

import { lazy, Suspense } from "react";
import type { MapPin } from "@/lib/dashboard/types";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? "";

const GoogleMap = lazy(() => import("./GoogleTripMap"));
const LibreMap = lazy(() => import("./MapLibreMap"));

type Props = {
  pins: MapPin[];
  className?: string;
  interactive?: boolean;
  fitBounds?: boolean;
};

export default function TripMapbox(props: Props) {
  const Impl = GOOGLE_KEY ? GoogleMap : LibreMap;
  return (
    <Suspense fallback={<div className={`${props.className ?? ""} animate-pulse bg-surface`} />}>
      <Impl {...props} />
    </Suspense>
  );
}
