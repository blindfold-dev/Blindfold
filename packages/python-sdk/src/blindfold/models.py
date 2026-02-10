"""Pydantic models for API responses"""

from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field


class DetectedEntity(BaseModel):
    """Detected entity in text"""

    entity_type: str = Field(
        ..., description='Entity type (e.g., "person", "email address", "phone number")'
    )
    text: str = Field(..., description="Original text of the entity")
    start: int = Field(..., description="Start index in text")
    end: int = Field(..., description="End index in text")
    score: float = Field(..., description="Confidence score (0-1)")

    model_config = ConfigDict(frozen=True)


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

    model_config = ConfigDict(frozen=True)


class DetectResponse(BaseModel):
    """Response from detect endpoint"""

    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected entities"
    )
    entities_count: int = Field(..., description="Count of detected entities")

    model_config = ConfigDict(frozen=True)


class DetokenizeResponse(BaseModel):
    """Response from detokenize endpoint"""

    text: str = Field(..., description="Original text with restored values")
    replacements_made: int = Field(..., description="Number of replacements made")

    model_config = ConfigDict(frozen=True)


class RedactResponse(BaseModel):
    """Response from redact endpoint"""

    text: str = Field(..., description="Text with PII permanently removed")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and redacted entities"
    )
    entities_count: int = Field(..., description="Number of entities redacted")

    model_config = ConfigDict(frozen=True)


class MaskResponse(BaseModel):
    """Response from mask endpoint"""

    text: str = Field(..., description="Text with PII partially masked")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and masked entities"
    )
    entities_count: int = Field(..., description="Number of entities masked")

    model_config = ConfigDict(frozen=True)


class SynthesizeResponse(BaseModel):
    """Response from synthesize endpoint"""

    text: str = Field(..., description="Text with synthetic fake data")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and synthesized entities"
    )
    entities_count: int = Field(..., description="Number of entities synthesized")

    model_config = ConfigDict(frozen=True)


class HashResponse(BaseModel):
    """Response from hash endpoint"""

    text: str = Field(..., description="Text with PII replaced by hash values")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and hashed entities"
    )
    entities_count: int = Field(..., description="Number of entities hashed")

    model_config = ConfigDict(frozen=True)


class EncryptResponse(BaseModel):
    """Response from encrypt endpoint"""

    text: str = Field(..., description="Text with PII encrypted")
    detected_entities: List[DetectedEntity] = Field(
        ..., description="List of detected and encrypted entities"
    )
    entities_count: int = Field(..., description="Number of entities encrypted")

    model_config = ConfigDict(frozen=True)


class BatchResponse(BaseModel):
    """Response from batch processing endpoints"""

    results: List[Dict[str, Any]] = Field(
        ..., description="Array of individual results (or {\"error\": \"...\"} for failed items)"
    )
    total: int = Field(..., description="Total number of texts submitted")
    succeeded: int = Field(..., description="Number of texts processed successfully")
    failed: int = Field(..., description="Number of texts that failed processing")

    model_config = ConfigDict(frozen=True)


class APIErrorResponse(BaseModel):
    """Error response from API"""

    detail: Optional[str] = None
    message: Optional[str] = None
