export interface DetectedEntity {
  entity_type: string;
  text: string;
  start: number;
  end: number;
  score: number;
}

export interface DetectResponse {
  detected_entities: DetectedEntity[];
  entities_count: number;
}

export interface TokenizeResponse {
  text: string;
  mapping: Record<string, string>;
  detected_entities: DetectedEntity[];
  entities_count: number;
}

export interface DetokenizeResponse {
  text: string;
  replacements_made: number;
}

export interface TextTransformResponse {
  text: string;
  detected_entities: DetectedEntity[];
  entities_count: number;
}

export interface EncryptResponse extends TextTransformResponse {
  encryption_key?: string;
}
