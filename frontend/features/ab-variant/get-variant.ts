import { getVariant as readVariant } from "@evinvest/experiments/next";
import {
  experiments,
  type ExperimentKey,
  type Variant,
} from "@/shared/config/experiments";
import { config } from "@/config";

/**
 * Resolves an experiment's variant.
 *
 * Production returns the control (first) variant without reading the `ab_<key>`
 * cookie, so tested routes stay statically rendered instead of paying the
 * per-request dynamic-render cost on the VPS. Development reads the cookie so
 * the dev A/B panel can switch variants live.
 *
 * Curried over the app's `experiments` config so sections call `getVariant("<key>")`
 * and the **page** stays agnostic of A/B.
 */
export function getVariant<K extends ExperimentKey>(
  key: K,
): Promise<Variant<K>> {
  if (config.isProduction) {
    return Promise.resolve(experiments[key].variants[0] as Variant<K>);
  }
  return readVariant(experiments, key);
}
