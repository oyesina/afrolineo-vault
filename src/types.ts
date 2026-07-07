/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProfileRole =
  | 'self'
  | 'father'
  | 'mother'
  | 'paternal_grandfather'
  | 'paternal_grandmother'
  | 'maternal_grandfather'
  | 'maternal_grandmother'
  | 'sibling'
  | 'uncle'
  | 'aunt';

export interface Profile {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  role: ProfileRole;
  birthYear: string;
  birthPlace: string;
  language: string; // Dialect or Mother tongue
  lga: string;      // Local Government Area or Administrative division
  ward: string;     // Political boundary or administrative ward
  familyCompound: string; // Ancestral sub-village/compound house
  familySizeEstimate: number; // Branches size description
  notes: string;
  isAlive: boolean;
  parentId?: string; // pointer to group lineages if needed
  avatarColor: string; // UI generation color
}

export interface OralHistory {
  id: string;
  profileId: string;
  title: string;
  durationSec: number;
  recordedAt: string;
  audioBase64?: string; // Voice memo in base64 WebM/WAV for storage
  transcript: string;  // Speech-to-text transcript
  summary?: string;     // Key ancestral tags or insights
  promptQuestion?: string; // Conversation starter question used
}

export interface ConversationStarter {
  id: string;
  category: 'origins' | 'childhood' | 'traditions' | 'wisdom' | 'migration';
  question: string;
  hint: string;
}

export interface DiscoveryMatch {
  matchedProfile: Profile;
  matchingField: 'familyCompound' | 'lga' | 'ward' | 'language';
  value: string;
  connectedRecordings: OralHistory[];
}

export interface LinkedRelative {
  id: string;
  myProfileId: string;        // Local Profile in user's tree being connected
  relativeName: string;       // Name of community relative
  relativeCompound: string;   // Compound name of community relative
  relativeLga: string;        // LGA of community relative
  clanshipType: 'close' | 'distant'; // Close or distant relative
  notes: string;              // Custom context on connection / clanship alignment
  linkedAt: string;
}

export interface LoginSession {
  id: string;
  email: string;
  name: string;
  deviceType: string;
  location: string;
  timestamp: string;
  status: 'Active' | 'Success' | 'Closed';
}

