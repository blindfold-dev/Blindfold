"""Detector registry: collects all detectors and filters by locale"""

from typing import Dict, List, Optional, Type

from .base import Detector, RegexDetector, RegionDetector

# Locale to entity type mappings
UNIVERSAL_DETECTORS: List[Type[Detector]] = []
REGION_DETECTORS: Dict[str, List[Type[Detector]]] = {
    "us": [],
    "eu": [],
    "uk": [],
}


def register_universal(cls: Type[Detector]) -> Type[Detector]:
    """Class decorator to register a universal (locale-independent) detector."""
    UNIVERSAL_DETECTORS.append(cls)
    return cls


def register_region(locale: str):
    """Class decorator factory to register a region-specific detector."""
    def decorator(cls: Type[Detector]) -> Type[Detector]:
        if locale not in REGION_DETECTORS:
            REGION_DETECTORS[locale] = []
        REGION_DETECTORS[locale].append(cls)
        return cls
    return decorator


class DetectorRegistry:
    """Builds a list of detector instances filtered by locale."""

    def __init__(
        self,
        locales: Optional[List[str]] = None,
    ) -> None:
        self.locales = [loc.lower() for loc in (locales or ["us"])]
        self._detectors: List[Detector] = []
        self._build()

    def _build(self) -> None:
        for cls in UNIVERSAL_DETECTORS:
            self._detectors.append(cls())

        for locale in self.locales:
            for cls in REGION_DETECTORS.get(locale, []):
                det = cls() if not issubclass(cls, RegionDetector) else cls(locale=locale)
                self._detectors.append(det)

    @property
    def detectors(self) -> List[Detector]:
        return self._detectors
