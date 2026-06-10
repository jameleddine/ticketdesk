/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  name: string;
  email: string;
  // department: string;
  title: string;
  avatar: string;
  ticketStatus: 'PENDING' | 'COLLECTED';
  collectedAt?: string;
  collectedBy?: string; // ID or Name of person who collected it
  signatureUrl?: string; // Base64 signature
  phone?: string;
  ticketCount?: number; // Representing Excel "Nombre de TR"
  sodexoCardNumber?: string; // Representing Excel "Numéro de Carnet SODEXO"
}

export interface TicketTransaction {
  id: string;
  pickerId: string;
  pickerName: string;
  pickerEmail: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetEmployeeEmail: string;
  type: 'SELF' | 'FRIEND'; // Was it picked up by self or friend?
  timestamp: string;
  signature: string; // Base64 signature image data
}

export interface EmailNotification {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  htmlBody: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'SIMULATED' | 'FAILED';
  type: 'SELF_PICKUP' | 'FRIEND_PICKUP' | 'FRIEND_NOTIFICATION';
  smtpError?: string;
  smtpInfo?: string;
}
