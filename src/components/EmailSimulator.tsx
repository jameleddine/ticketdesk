/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Clock, Send, ShieldCheck, CornerUpLeft, Trash2, Eye } from 'lucide-react';
import { EmailNotification } from '../types';

interface EmailSimulatorProps {
  emails: EmailNotification[];
  onClearAll: () => void;
}

export default function EmailSimulator({ emails, onClearAll }: EmailSimulatorProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  React.useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    } else if (emails.length === 0) {
      setSelectedEmail(null);
    } else if (emails.length > 0 && selectedEmail) {
      // Keep selected if still in list, or refresh content
      const found = emails.find(e => e.id === selectedEmail.id);
      if (found) {
        setSelectedEmail(found);
      } else {
        setSelectedEmail(emails[0]);
      }
    }
  }, [emails]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 h-[640px] flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              <span>Simulation Serveur SMTP & Wevioo Notify</span>
              <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
            </h2>
            <p className="text-xs text-slate-400">Microsoft Exchange Online / Outlook Mock Service</p>
          </div>
        </div>

        {emails.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Vider les logs
          </button>
        )}
      </div>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Email Inbox List */}
        <div className="w-1/3 border-r border-slate-800 overflow-y-auto bg-slate-950 flex flex-col divide-y divide-slate-900">
          {emails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Mail className="w-8 h-8 opacity-20 mb-2 text-slate-400" />
              <p className="text-xs font-medium">Aucun mail envoyé</p>
              <p className="text-[10px] text-slate-600 mt-1">Les notifications s'afficheront ici en temps réel dès qu'un retrait de tickets est signé.</p>
            </div>
          ) : (
            emails.map((email) => {
              const date = new Date(email.timestamp);
              const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const isSelected = selectedEmail?.id === email.id;
              
              return (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-3.5 transition-colors focus:outline-none flex flex-col space-y-1.5 ${isSelected ? 'bg-slate-800/60 border-l-4 border-[#FF6B35]' : 'hover:bg-slate-900 border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[140px]">
                      {email.recipient}
                    </span>
                    <span className="text-[10px] text-[#00A4E4] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>
                  
                  <span className={`text-xs font-medium truncate w-full ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {email.subject}
                  </span>
                  
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {email.body.substring(0, 50)}...
                  </p>

                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      email.type === 'SELF_PICKUP' ? 'bg-indigo-505/20 text-indigo-300' :
                      email.type === 'FRIEND_PICKUP' ? 'bg-emerald-505/20 text-emerald-300' :
                      'bg-[#FF6B35]/10 text-orange-300'
                    }`}>
                      {email.type}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" /> Sent
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Email Detailed View */}
        <div className="flex-1 bg-slate-900 overflow-y-auto flex flex-col">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col">
              {/* Meta Info */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-medium">De: </span>
                    <span className="font-semibold text-slate-300">{selectedEmail.sender}</span>
                  </div>
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> DKIM & SPF Validated
                  </span>
                </div>
                
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 font-medium">À: </span>
                  <span className="font-semibold text-[#FF6B35]">{selectedEmail.recipient}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                    <span>Envoyé le: </span>
                    <span>{new Date(selectedEmail.timestamp).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Email Body Template */}
              <div className="p-6 bg-slate-950 flex-1">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-slate-800 max-w-xl mx-auto">
                  {/* Email Mockup Header */}
                  <div className="bg-slate-900 p-5 border-b border-slate-100 flex items-center justify-between" style={{ borderTop: '4px solid #1A3B8B' }}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-white font-sans">
                          we<span className="text-[#FF6B35]">vioo</span>
                        </span>
                        <span className="text-[10px] bg-white/10 text-slate-300 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded font-sans">Tunis Office</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-sans tracking-tight">The Digital Enablement Partner</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-[#1A3B8B]/10 text-white border border-[#1A3B8B]/20 px-2.5 py-1 rounded-full font-mono font-medium">
                        Réf: VT-2026-M
                      </span>
                    </div>
                  </div>

                  {/* HTML Content (rendered inside a clean frame) */}
                  <div 
                    className="p-6 text-sm leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                  />

                  {/* Small signature visual in email */}
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Service Logistique Wevioo</p>
                      <p className="text-[10px] text-slate-500">Centre Urbain Nord, 1082 Tunis, Tunisie</p>
                      <p className="text-[9px] text-[#00A4E4]/80 mt-0.5">contact@wevioo.com — wevioo.com</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-100 uppercase tracking-widest">
                        Digital Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Mail className="w-12 h-12 opacity-10 mb-3" />
              <p>Sélectionnez une notification pour afficher le mail</p>
              <p className="text-xs text-slate-600 max-w-xs mt-1">Vous pourrez examiner le contenu HTML complet du message envoyé par notre serveur SMTP virtuel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
