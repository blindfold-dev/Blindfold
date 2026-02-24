// Detector registry: collects all detectors and filters by locale

import { Detector } from './base'

// Type for a detector constructor (zero-arg)
type DetectorClass = new () => Detector

// Module-level arrays populated by registerUniversal / registerRegion calls
const UNIVERSAL_DETECTORS: DetectorClass[] = []
const REGION_DETECTORS: Record<string, DetectorClass[]> = {
  us: [],
  eu: [],
  uk: [],
}

/** Register a universal (locale-independent) detector class. */
export function registerUniversal(cls: DetectorClass): void {
  UNIVERSAL_DETECTORS.push(cls)
}

/** Register a region-specific detector class. */
export function registerRegion(locale: string, cls: DetectorClass): void {
  if (!REGION_DETECTORS[locale]) {
    REGION_DETECTORS[locale] = []
  }
  REGION_DETECTORS[locale].push(cls)
}

/** Builds a list of detector instances filtered by locale and entity type. */
export class DetectorRegistry {
  private _detectors: Detector[] = []

  constructor(locales?: string[], entityTypes?: Set<string>) {
    const resolvedLocales = (locales ?? ['us']).map((loc) => loc.toLowerCase())
    this._build(resolvedLocales, entityTypes)
  }

  private _build(locales: string[], entityTypes?: Set<string>): void {
    for (const Cls of UNIVERSAL_DETECTORS) {
      const det = new Cls()
      if (entityTypes && !entityTypes.has(det.entityType)) {
        continue
      }
      this._detectors.push(det)
    }

    for (const locale of locales) {
      const regionClasses = REGION_DETECTORS[locale] ?? []
      for (const Cls of regionClasses) {
        const det = new Cls()
        if (entityTypes && !entityTypes.has(det.entityType)) {
          continue
        }
        this._detectors.push(det)
      }
    }
  }

  get detectors(): Detector[] {
    return this._detectors
  }
}
