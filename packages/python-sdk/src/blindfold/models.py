"""Pydantic models for API responses"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class DetectedEntity(BaseModel):
    """Detected entity in text"""

    entity_type: str = Field(..., description="Entity type (e.g., PERSON, EMAIL_ADDRESS)")
    text: str = Field(..., description="Original text of the entity")
    start: int = Field(..., description="Start index in text")
    end: int = Field(..., description="End index in text")
    score: float = Field(..., description="Confidence score (0-1)")

    class Config:
        frozen = True


class TokenizeResponse(BaseModel):
    """Response from tokenize endpoint"""

    text: str = Field(..., description="Anonymized text with placeholders")
    mapping: Dict[str, str] = Field(
        ..., description="Mapping of tokens to original values"
    )
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected entities"
    )
    entities_count: int = Field(..., description="Count of detected entities")

    class Config:
        frozen = True


class DetokenizeResponse(BaseModel):
    """Response from detokenize endpoint"""

    text: str = Field(..., description="Original text with restored values")
    replacements_made: int = Field(..., description="Number of replacements made")

    class Config:
        frozen = True


class RedactResponse(BaseModel):
    """Response from redact endpoint"""

    text: str = Field(..., description="Text with PII permanently removed")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and redacted entities"
    )
    entities_count: int = Field(..., description="Number of entities redacted")

    class Config:
        frozen = True


class MaskResponse(BaseModel):
    """Response from mask endpoint"""

    text: str = Field(..., description="Text with PII partially masked")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and masked entities"
    )
    entities_count: int = Field(..., description="Number of entities masked")

    class Config:
        frozen = True


class SynthesizeResponse(BaseModel):
    """Response from synthesize endpoint"""

    text: str = Field(..., description="Text with synthetic fake data")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and synthesized entities"
    )
    entities_count: int = Field(..., description="Number of entities synthesized")

    class Config:
        frozen = True


class HashResponse(BaseModel):
    """Response from hash endpoint"""

    text: str = Field(..., description="Text with PII replaced by hash values")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and hashed entities"
    )
    entities_count: int = Field(..., description="Number of entities hashed")

    class Config:
        frozen = True


class EncryptResponse(BaseModel):
    """Response from encrypt endpoint"""

    text: str = Field(..., description="Text with PII encrypted")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and encrypted entities"
    )
    entities_count: int = Field(..., description="Number of entities encrypted")

    class Config:
        frozen = True


class APIErrorResponse(BaseModel):
    """Error response from API"""

    detail: Optional[str] = None
    message: Optional[str] = None
