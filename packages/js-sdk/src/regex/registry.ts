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

/** Builds a list of detector instances filtered by locale. */
export class DetectorRegistry {
  private _detectors: Detector[] = []

  constructor(locales?: string[]) {
    const resolvedLocales = (locales ?? ['us']).map((loc) => loc.toLowerCase())
    this._build(resolvedLocales)
  }

  private _build(locales: string[]): void {
    for (const Cls of UNIVERSAL_DETECTORS) {
      this._detectors.push(new Cls())
    }

    for (const locale of locales) {
      const regionClasses = REGION_DETECTORS[locale] ?? []
      for (const Cls of regionClasses) {
        this._detectors.push(new Cls())
      }
    }
  }

  get detectors(): Detector[] {
    return this._detectors
  }
}
