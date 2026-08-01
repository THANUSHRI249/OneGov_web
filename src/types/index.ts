export interface DatabaseDocument {
  id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  upload_date: string;
}

export interface Application {
  id: string;
  user_id: string;
  application_name: string;
  application_number: string;
  status: ApplicationStatus;
  submitted_date: string;
  latest_update: string | null;
  last_updated: string;
}

export interface ApplicationUpdate {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  note: string | null;
  created_at: string;
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Additional Document Required'
  | 'Approved'
  | 'Rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Submitted',
  'Under Verification',
  'Additional Document Required',
  'Approved',
  'Rejected',
];

export const DOCUMENT_TYPES = [
  'Aadhaar',
  'PAN',
  'Address Proof',
  'Passport',
  'GST Certificate',
  'FSSAI Certificate',
  'MSME Certificate',
  'Business Registration Certificate',
  'Other',
] as const;

export const APPLICATION_TYPES = [
  'GST Registration',
  'FSSAI License',
  'MSME Registration',
  'Shops & Establishment Registration',
] as const;
