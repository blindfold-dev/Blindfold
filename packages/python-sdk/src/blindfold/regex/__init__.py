"""Local regex-based PII detection module (zero external dependencies)."""

from .entities import EntityType, PIIMatch
from .scanner import PIIScanner

__all__ = ["PIIScanner", "EntityType", "PIIMatch"]
