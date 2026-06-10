/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Database, Award, Mail, Sparkles, HelpCircle, 
  Layers, CheckCircle2, ChevronRight, UserCheck, ShieldCheck, MailX, Send, Users
} from 'lucide-react';
import { Employee, EmailNotification } from './types';
import { INITIAL_EMPLOYEES } from './data/mockEmployees';
import KioskMode from './components/KioskMode';
import DirectoryView from './components/DirectoryView';
import EmailSimulator from './components/EmailSimulator';
import EligibleManager from './components/EligibleManager';
import WeviooLogo from './components/WeviooLogo';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('wevioo_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [emails, setEmails] = useState<EmailNotification[]>(() => {
    const saved = localStorage.getItem('wevioo_emails');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab ] = useState<'KIOSK' | 'DIRECTORY' | 'SMTP' | 'ELIGIBLES'>('KIOSK');

  // Sync to local storage for persistent testing
  useEffect(() => {
    localStorage.setItem('wevioo_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('wevioo_emails', JSON.stringify(emails));
  }, [emails]);

  // Handle single employee status reset
  const handleResetStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return {
          ...emp,
          ticketStatus: 'PENDING',
          collectedAt: undefined,
          collectedBy: undefined,
          signatureUrl: undefined
        };
      }
      return emp;
    }));
  };

  // Reset all statuses
  const handleResetAll = () => {
    setEmployees(prev => prev.map(emp => ({ 
      ...emp, 
      ticketStatus: 'PENDING',
      collectedAt: undefined,
      collectedBy: undefined,
      signatureUrl: undefined
    })));
    setEmails([]);
  };

  const handleClearEmails = () => {
    setEmails([]);
  };

  // Core callback when a ticket pickup is successfully signed at the kiosk
  const handleConfirmDelivery = (
    pickerId: string, 
    targets: { id: string; name: string; email: string; type: 'SELF' | 'FRIEND' }[], 
    signatureUrl: string
  ) => {
    const picker = employees.find(e => e.id === pickerId);
    if (!picker) return;

    const timestampStr = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const currentUTC = new Date().toISOString();

    // 1. Update status inside Active Directory employees list
    setEmployees(prev => prev.map(emp => {
      const match = targets.find(t => t.id === emp.id);
      if (match) {
        return {
          ...emp,
          ticketStatus: 'COLLECTED',
          collectedAt: timestampStr,
          collectedBy: picker.name,
          signatureUrl: signatureUrl
        };
      }
      return emp;
    }));

    // 2. Generate and trigger Emails
    const newEmails: EmailNotification[] = [];

    targets.forEach(target => {
      const isSelf = target.type === 'SELF';
      const emailId = 'msg-' + Math.random().toString(36).substring(2, 9);
      
      const subject = isSelf 
        ? `[Wevioo] Confirmation - Retrait de vos Tickets Restaurant`
        : `[Wevioo] Notification - Vos Tickets Restaurant récupérés par ${picker.name}`;

      const recipientText = target.name;
      
      let htmlBody = '';

      if (isSelf) {
        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 15px;">Bonjour <strong>${target.name}</strong>,</p>
            <p style="font-size: 14px;">Nous vous confirmons que vous avez retiré votre <strong>carnet de tickets restaurant</strong> ce jour au bureau de Wevioo Tunis.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0; margin-bottom: 10px; color: #1A3B8B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Récapitulatif de votre Retrait</h4>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 150px;"><strong>Date & Heure :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b;">${timestampStr}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Lieu de Retrait :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b;">Welcome Desk — ZI chotrana II, Ariana</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Mode :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: bold; color: #1A3B8B;">Retrait Personnel (Original)</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-bottom: 25px;">Cette notification faisant foi de signature numérique et d'archivage légal pour le service des ressources humaines.</p>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 15px;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">Ceci est un email automatique du système TunisDesk de Wevioo. Merci de ne pas y répondre.</p>
            </div>
          </div>
        `;
      } else {
        htmlBody = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 15px;">Bonjour <strong>${target.name}</strong>,</p>
            <p style="font-size: 14px;">Nous vous informons que votre <strong>carnet de tickets restaurant</strong> a été récupéré pour votre compte par votre collègue <strong>${picker.name}</strong> (${picker.email}).</p>
            
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0; margin-bottom: 10px; color: #b45309; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Détails de délégation</h4>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #78350f; width: 150px;"><strong>Retiré par :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: bold;">${picker.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78350f;"><strong>Date de Retrait :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b;">${timestampStr}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78350f;"><strong>Service Logistique :</strong></td>
                  <td style="padding: 4px 0; color: #1e293b;">Welcome Desk — Tunis Nord Office</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Veuillez vous rapprocher de <strong>${picker.name}</strong> pour récupérer vos bons de restauration physiques.</p>
            
            <p style="font-size: 11px; color: #94a3b8; font-style: italic;">Note de sécurité: Si vous n'avez pas autorisé cette collecte déléguée, veuillez contacter immédiatement l'Office Manager de Wevioo Tunis.</p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center;">Ceci est un message interne sécurité du groupe Wevioo — TunisDesk System.</p>
            </div>
          </div>
        `;
      }

      newEmails.unshift({
        id: emailId,
        sender: "nepasrepondre.logistique@wevioo.com",
        recipient: target.email,
        subject: subject,
        body: isSelf 
          ? `Bonjour ${target.name}, Nous vous confirmons que vous avez bien retiré vos tickets restaurant pour ce mois à l'accueil.`
          : `Bonjour ${target.name}, Votre carnet de tickets restaurant a été retiré hier/aujourd'hui par votre collègue ${picker.name}.`,
        htmlBody: htmlBody,
        timestamp: currentUTC,
        status: 'SENT',
        type: isSelf ? 'SELF_PICKUP' : 'FRIEND_PICKUP'
      });

      // Fire HTTP request to server-side SMTP dispatcher
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: target.email,
          subject: subject,
          htmlBody: htmlBody,
          textBody: isSelf 
            ? `Bonjour ${target.name}, Nous vous confirmons que vous avez bien retiré vos tickets restaurant pour ce mois à l'accueil.`
            : `Bonjour ${target.name}, Votre carnet de tickets restaurant a été retiré par votre collègue ${picker.name}.`
        })
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => { throw new Error(errData.error || errData.message || 'SMTP Error'); });
        }
        return res.json();
      })
      .then(data => {
        setEmails(prev => prev.map(em => {
          if (em.id === emailId) {
            return {
              ...em,
              status: data.status === 'sent' ? 'DELIVERED' : 'SIMULATED',
              smtpInfo: data.messageId ? `SMTP MsgID: ${data.messageId}` : undefined
            };
          }
          return em;
        }));
      })
      .catch(smtpErr => {
        console.error('[TunisDesk SMTP Error]:', smtpErr);
        setEmails(prev => prev.map(em => {
          if (em.id === emailId) {
            return {
              ...em,
              status: 'FAILED',
              smtpError: smtpErr.message || 'SMTP Relay delivery failed'
            };
          }
          return em;
        }));
      });
    });

    setEmails(prev => [...newEmails, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col text-slate-800 antialiased selection:bg-wevioo-cyan/20 selection:text-wevioo-blue">
      
      {/* Dynamic Wevioo Corporate Nav Header */}
      <header className="bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Authentic Brand Logo Custom Component */}
          <WeviooLogo dark={false} />

          {/* Navigation Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              id="nav-kiosk"
              onClick={() => setActiveTab('KIOSK')}
              className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'KIOSK' 
                  ? 'bg-wevioo-blue text-white shadow-md shadow-wevioo-blue/10' 
                  : 'text-slate-650 hover:text-wevioo-blue hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${activeTab === 'KIOSK' ? 'text-wevioo-cyan' : 'text-slate-400'}`} />
              Guichet d'Accueil
            </button>
            <button
              id="nav-directory"
              onClick={() => setActiveTab('DIRECTORY')}
              className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'DIRECTORY' 
                  ? 'bg-wevioo-blue text-white shadow-md shadow-wevioo-blue/10' 
                  : 'text-slate-650 hover:text-wevioo-blue hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${activeTab === 'DIRECTORY' ? 'text-wevioo-cyan' : 'text-slate-400'}`} />
              Annuaire AD (Mock)
            </button>
            <button
              id="nav-eligibles"
              onClick={() => setActiveTab('ELIGIBLES')}
              className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'ELIGIBLES' 
                  ? 'bg-wevioo-blue text-white shadow-md shadow-wevioo-blue/10' 
                  : 'text-slate-650 hover:text-wevioo-blue hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'ELIGIBLES' ? 'text-wevioo-cyan' : 'text-slate-400'}`} />
              Éligibles & Import
            </button>
            <button
              id="nav-smtp"
              onClick={() => setActiveTab('SMTP')}
              className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 relative ${
                activeTab === 'SMTP' 
                  ? 'bg-wevioo-blue text-white shadow-md shadow-wevioo-blue/10' 
                  : 'text-slate-650 hover:text-wevioo-blue hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Mail className={`w-3.5 h-3.5 ${activeTab === 'SMTP' ? 'text-wevioo-cyan' : 'text-slate-400'}`} />
              SMTP Logs Simulator
              {emails.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-wevioo-cyan text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                  {emails.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Grid with Corporate Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Screen Left (Kiosk Desk Mode or Active Directory) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'KIOSK' && (
            <KioskMode 
              employees={employees} 
              onConfirmDelivery={handleConfirmDelivery}
            />
          )}

          {activeTab === 'DIRECTORY' && (
            <DirectoryView 
              employees={employees} 
              onResetStatus={handleResetStatus} 
              onResetAll={handleResetAll}
            />
          )}

          {activeTab === 'SMTP' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-wevioo-blue" />
                  Aperçu Global de la Messagerie Interne
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ce moniteur écoute l'activité de l'API de notification Wevioo. Chaque signature numérique génère un rapport de livraison envoyé de façon asynchrone pour simuler de vraies requêtes de production.
                </p>
              </div>
              <EmailSimulator emails={emails} onClearAll={handleClearEmails} />
            </div>
          )}

          {activeTab === 'ELIGIBLES' && (
            <EligibleManager 
              employees={employees} 
              setEmployees={setEmployees} 
            />
          )}

        </div>

        {/* Corporate Info Sidebar Right */}
        <div className="space-y-6">
          
          {/* Wevioo Tunis HQ Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100/80 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-wevioo-cyan">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-wevioo-blue text-sm leading-none">Wevioo Tunisie HQ</h3>
                <span className="text-[10px] text-slate-400 font-mono">Tunis Office Cluster</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">Adresse :</span>
                <span className="font-semibold text-slate-700 text-left">Immeuble WEVIOO Technopark El Ghazela 2088 Tunis-، Ariana- Tunisie 2088</span>
              </div>
              <p className="flex justify-between">
                <span className="text-slate-400">Service :</span>
                <span className="font-semibold text-slate-700 text-right font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">ADP</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-center">
              <p className="text-[11px] text-slate-500 font-medium">Bons de Restauration SODEXO</p>
              <p className="text-xs font-black text-wevioo-blue mt-0.5">22 Bons par Carnet / Collaborateur</p>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100/80 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-wevioo-cyan" />
              Activité TunisDesk
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Membres éligibles :</span>
                <span className="font-black text-slate-800">{employees.length}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tickets retirés :</span>
                <span className="font-black text-emerald-600">
                  {employees.filter(e => e.ticketStatus === 'COLLECTED').length} / {employees.length}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Simulateur SMTP Queue :</span>
                <span className="font-black text-wevioo-cyan">
                  {emails.length} messages envoyés
                </span>
              </div>
            </div>

            {/* Quick Link Helper */}
            {activeTab !== 'SMTP' && (
              <button
                onClick={() => setActiveTab('SMTP')}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-wevioo-cyan/5 border border-slate-200 hover:border-wevioo-cyan/30 text-slate-705 hover:text-slate-900 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>Ouvrir l'Inbox de Simulation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Directory Connection Details */}
          <div className="bg-slate-900 text-slate-400 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Statut AD Microsoft Azure
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Dans un déploiement réel, Wevioo utilise Azure Active Directory (Azure AD) via l'API Microsoft Graph pour synchroniser listes de diffusion et profils.
            </p>
            
            <div className="flex gap-2 text-[10px] items-center bg-slate-950 px-3 py-2 rounded border border-slate-800 font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>Syncing: OK — Mock Data active</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer corporate signature */}
      <footer className="bg-slate-900 text-slate-500 border-t border-slate-800/80 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <WeviooLogo dark={true} />
            <p className="text-[11px] text-slate-500 mt-2 font-sans pl-1">
              © {new Date().getFullYear()} Wevioo Group. Tunis Office. Tous droits réservés.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">Politique de Sécurité</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Support IT Wevioo 1082</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
