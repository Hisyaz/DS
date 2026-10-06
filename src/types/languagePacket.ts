export interface LanguagePacketMeta {
  formatVersion: '1.0.0';
  packetId: string;
  languageCode: string; // e.g. 'en-GB'
  languageName: string; // e.g. 'British English'
  nativeName: string;   // e.g. 'English (UK)'
  region: string;       // e.g. 'United Kingdom'
  flag: string;         // e.g. '🇬🇧'
  author: string;
  description: string;
  createdAt: string;
  totalKeys: number;
}

export interface LanguagePacket {
  meta: LanguagePacketMeta;
  translations: Record<string, string>;
}

export interface PacketValidationResult {
  valid: boolean;
  error?: string;
  packet?: LanguagePacket;
  keyCount?: number;
}
