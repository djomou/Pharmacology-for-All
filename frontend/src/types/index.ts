export interface Drug {
  productId:     number;
  name:          string;
  shortName?:    string;
  commercialName?: string;
  marketStatus:  number;
  type?:         number;
  formId?:       number;
}

export interface Molecule {
  moleculeId: number;
  name:       string;
}

export interface Company {
  companyId: number;
  name:      string;
  shortName?: string;
  countryCode?: string;
}

export interface Interaction {
  interactionId: number;
  molecule1Id:   number;
  molecule2Id:   number;
  type?:         number;
  description?:  string;
  risk?:         number;
}

export interface Notification {
  id:        number;
  title:     string;
  message:   string;
  type:      string;
  isRead:    boolean;
  createdAt: string;
}

export interface AdvisorResult {
  sessionId:         string;
  analyzedText:      string;
  detectedSymptoms:  string[];
  suggestions:       Array<{
    productId:  number;
    name:       string;
    shortName:  string;
    matchedOn:  string;
    confidence: string;
  }>;
  warnings:          string[];
  disclaimer:        string;
  emergencyMessage?: string;
  timestamp:         string;
}
