/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, Clock, Send, ShieldCheck, Trash2, Eye, HelpCircle, 
  Settings, Key, AlertTriangle, Terminal, CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import { EmailNotification } from '../types';

interface EmailSimulatorProps {
  emails: EmailNotification[];
  onClearAll: () => void;
}

export default function EmailSimulator({ emails, onClearAll }: EmailSimulatorProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<{
    configured: boolean;
    host: string | null;
    port: number | null;
    user: string | null;
    fromAddress: string | null;
    secure: boolean;
  } | null>(null);

  // Fetch the real server-side SMTP configuration status
  const refreshSmtpConfig = () => {
    fetch('/api/smtp-config')
      .then(res => res.json())
      .then(data => setSmtpConfig(data))
      .catch(err => console.error('[TunisDesk] SMTP config check failed:', err));
  };

  useEffect(() => {
    refreshSmtpConfig();
  }, [emails]); // Refresh whenever emails change, indicating progress

  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    } else if (emails.length === 0) {
      setSelectedEmail(null);
    } else if (emails.length > 0 && selectedEmail) {
      const found = emails.find(e => e.id === selectedEmail.id);
      if (found) {
        setSelectedEmail(found);
      } else {
        setSelectedEmail(emails[0]);
      }
    }
  }, [emails]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 h-[680px] flex flex-col relative" id="smtp-simulator">
      
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-wevioo-blue flex items-center justify-center text-white shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-semibold text-sm tracking-tight text-white">
                Logs de Messagerie & Serveur SMTP
              </h2>
              {smtpConfig?.configured ? (
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Relais SMTP Réel Actif
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/20 font-medium font-sans">
                  Simulation Bac à Sable (Sandbox)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {smtpConfig?.configured 
                ? `Relais mail connecté sur ${smtpConfig.host}:${smtpConfig.port}` 
                : 'Configurez vos variables d\'environnement SMTP pour envoyer de vrais emails'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 font-semibold ${
              showConfigGuide 
                ? 'bg-wevioo-cyan border-wevioo-cyan text-white shadow-md' 
                : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/40 text-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {showConfigGuide ? 'Cacher le Guide SMTP' : 'Configurer l\'SMTP'}
          </button>

          {emails.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/15 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        
        {/* Left Side: Email List */}
        <div className="w-full sm:w-1/3 border-r border-slate-800 overflow-y-auto bg-slate-950 flex flex-col divide-y divide-slate-900 shrink-0">
          {emails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 my-auto">
              <Mail className="w-8 h-8 opacity-20 mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Aucun email dans la boîte d'envoi</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] mx-auto leading-relaxed">
                Les rapports de retrait s'afficheront ici dès qu'un collaborateur signera au Guichet d'Accueil.
              </p>
            </div>
          ) : (
            emails.map((email) => {
              const date = new Date(email.timestamp);
              const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const isSelected = selectedEmail?.id === email.id;
              
              return (
                <button
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (window.innerWidth < 640) {
                      // auto scroll or layout action for mobile could happen but simple toggle is good
                    }
                  }}
                  className={`w-full text-left p-3.5 transition-colors focus:outline-none flex flex-col space-y-1.5 ${
                    isSelected 
                      ? 'bg-slate-800/60 border-l-4 border-wevioo-blue' 
                      : 'hover:bg-slate-900 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-slate-450 truncate max-w-[125px]">
                      {email.recipient}
                    </span>
                    <span className="text-[9px] text-wevioo-cyan font-mono flex items-center gap-0.5 shrink-0">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>
                  
                  <span className={`text-[11px] font-bold truncate w-full ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {email.subject}
                  </span>
                  
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {email.body.substring(0, 45)}...
                  </p>

                  {/* Status pills inside List */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider ${
                      email.type === 'SELF_PICKUP' ? 'bg-indigo-500/10 text-indigo-300' :
                      email.type === 'FRIEND_PICKUP' ? 'bg-emerald-500/10 text-emerald-300' :
                      'bg-wevioo-cyan/15 text-cyan-300'
                    }`}>
                      {email.type === 'SELF_PICKUP' ? 'PERSONAL' : 'DELEGATED'}
                    </span>

                    {email.status === 'SENT' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 animate-pulse flex items-center gap-0.5">
                        <Send className="w-2.5 h-2.5" /> Envoi...
                      </span>
                    )}

                    {email.status === 'DELIVERED' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        ✔ SMTP Ok
                      </span>
                    )}

                    {email.status === 'SIMULATED' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-300 border border-amber-500/15">
                        🧪 Simulé
                      </span>
                    )}

                    {email.status === 'FAILED' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20" title={email.smtpError}>
                        ❌ Échec SMTP
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed View or SMTP configure guide helper */}
        <div className="hidden sm:flex flex-1 bg-slate-900 overflow-y-auto flex-col relative min-w-0">
          
          {showConfigGuide ? (
            /* Show SMTP interactive setup guide on the main panel */
            <SmtpSetupGuide config={smtpConfig} onClose={() => setShowConfigGuide(false)} />
          ) : selectedEmail ? (
            /* Showing selected Email body */
            <div className="flex-1 flex flex-col">
              {/* Meta details dashboard */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-350">
                    <span className="text-slate-500 font-medium">De : </span>
                    <span className="font-semibold">{selectedEmail.sender}</span>
                  </div>
                  
                  {/* Status detailed validation badge */}
                  {selectedEmail.status === 'DELIVERED' && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20 font-mono font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> SMTP RÉEL : TRANSMIS
                    </span>
                  )}
                  {selectedEmail.status === 'SIMULATED' && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/15 font-mono">
                      🧪 SIMULATION BAC À SABLE
                    </span>
                  )}
                  {selectedEmail.status === 'FAILED' && (
                    <span className="text-[10px] bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-500/20 font-mono font-extrabold" title={selectedEmail.smtpError}>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" /> ERREUR CLIENT SMTP
                    </span>
                  )}
                  {selectedEmail.status === 'SENT' && (
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-cyan-500/15 font-mono animate-pulse">
                      Connexion Serveur en cours...
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-slate-350">
                  <span className="text-slate-500 font-medium">À : </span>
                  <span className="font-semibold text-wevioo-cyan">{selectedEmail.recipient}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>Horodatage : {new Date(selectedEmail.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  {/* Message reference trace details */}
                  {selectedEmail.smtpInfo && (
                    <div className="text-[8px] max-w-[180px] bg-slate-950 p-1 rounded font-mono text-slate-400 border border-slate-800 truncate" title={selectedEmail.smtpInfo}>
                      {selectedEmail.smtpInfo}
                    </div>
                  )}
                  {selectedEmail.smtpError && (
                    <div className="text-[9px] max-w-[200px] bg-rose-950/40 text-rose-350 p-1.5 rounded font-mono border border-rose-500/20 leading-relaxed break-words" title={selectedEmail.smtpError}>
                      <span className="font-bold uppercase text-[8px] text-rose-400 block mb-0.5">Raison du rejet :</span>
                      {selectedEmail.smtpError}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Content Container rendered cleanly inside white panel mockup */}
              <div className="p-6 bg-slate-950 flex-1 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-slate-800 max-w-xl mx-auto">
                  {/* SMTP Mockup Header */}
                  <div className="bg-slate-900 p-4 border-b border-slate-100 flex items-center justify-between pb-4" style={{ borderTop: '4px solid #1A3B8B' }}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-extrabold tracking-tight text-white font-sans">
                          we<span className="text-wevioo-cyan">vioo</span>
                        </span>
                        <span className="text-[9px] bg-white/10 text-slate-300 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded font-sans scale-90">Tunis HQ</span>
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5 font-sans tracking-tight">The Digital Enablement Partner</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-wevioo-blue/10 text-white border border-wevioo-blue/20 px-2 py-0.5 rounded-full font-mono font-medium">
                        Réf: VT-2026-M
                      </span>
                    </div>
                  </div>

                  {/* HTML Email Wrapper inside Iframe / Shadow DOM style */}
                  <div 
                    className="p-6 text-xs leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                  />

                  {/* Professional corporate email signature block */}
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-between text-[9px] text-slate-500">
                    <div>
                      <p className="uppercase tracking-wider font-bold text-slate-700">Service ADP</p>
                      <p className="text-slate-450 mt-0.5">Immeuble WEVIOO Technopark El Ghazela 2088 Tunis-، Ariana- Tunisie 2088</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-1.5 py-0.5 bg-indigo-50 text-wevioo-blue font-bold rounded border border-indigo-100 uppercase tracking-widest text-[8px] scale-95-percentage">
                        Secured TunisDesk
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 my-auto">
              <Mail className="w-12 h-12 opacity-10 mb-3" />
              <p className="text-slate-300 font-bold text-sm">Aucun message sélectionné</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Choisissez l'une des notifications dans la liste de gauche pour visualiser le rapport de retrait et l'émargement tel qu'il est envoyé.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Mobile View Support Overlay when a guide is toggled */}
      {showConfigGuide && (
        <div className="block sm:hidden absolute inset-0 bg-slate-900 z-50 overflow-y-auto">
          <SmtpSetupGuide config={smtpConfig} onClose={() => setShowConfigGuide(false)} />
        </div>
      )}
    </div>
  );
}

/**
 * Educational Blueprint Component rendering standard SMTP configuration setup steps
 */
function SmtpSetupGuide({ config, onClose }: { config: any; onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-900 p-6 space-y-5 overflow-y-auto animate-fade-in text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-wevioo-cyan" />
          <div>
            <h3 className="font-bold text-sm text-white">Consignes d'intégration SMTP</h3>
            <p className="text-[10px] text-slate-400">Comment relier TunisDesk à votre vrai serveur d'envoi d'emails</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Fermer le guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Live Status indicator table */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 font-sans">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Statut de la Configuration Serveur
        </h4>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Host Relais SMTP :</span>
            <strong className="font-mono text-[11px] text-slate-300">{config?.host || 'Non renseigné (Vide)'}</strong>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Port d'écoute :</span>
            <strong className="font-mono text-[11px] text-slate-300">{config?.port || '—'}</strong>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Utilisateur SMTP :</span>
            <code className="text-[11px] text-wevioo-cyan">{config?.user || '—'}</code>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Chiffrement TLS /SSL :</span>
            <strong className="text-[11px] text-slate-350">{config?.configured ? (config.secure ? 'SSL (Port 465)' : 'STARTTLS (Port 587)') : '—'}</strong>
          </div>
        </div>

        {config?.configured ? (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Félicitations :</strong> Votre serveur est configuré et prêt. TunisDesk redirigera les fiches de livraison d'émargement directement sur les adresses emails de vos collaborateurs !</span>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Mode de simulation actif :</strong> En l'absence de clés SMTP réelles, le Node.js simule l'envoi vers un bac à salle en mémoire. Aucun email n'est envoyé aux serveurs de messagerie externes.</span>
          </div>
        )}
      </div>

      {/* Configuration steps workflow */}
      <div className="space-y-4 text-xs leading-relaxed text-slate-300">
        <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
          <Key className="w-4 h-4 text-amber-400" />
          Comment configurer vos Identifiants (SMTP Secrets)
        </h4>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-wevioo-blue text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
            <div>
              <p className="font-bold text-white">Sélectionner un fournisseur SMTP</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Vous pouvez utiliser le serveur SMTP de votre entreprise <strong>Wevioo</strong> / Exchange Online, ou bien un fournisseur SMTP de test ou personnel tel que <strong>Gmail</strong>, <strong>SendGrid</strong>, ou <strong>Mailtrap</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-wevioo-blue text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
            <div>
              <p className="font-bold text-white">Saisir les Secrets d'Environnement dans AI Studio</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Allez dans le menu <strong>Secrets / Paramètres</strong> (l'onglet horizontal d'AI Studio) et ajoutez les variables suivantes :
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] mt-2 space-y-1 select-all text-cyan-400">
                <div>SMTP_HOST="smtp.gmail.com" <span className="text-slate-500">(ou hôte Exchange Wevioo)</span></div>
                <div>SMTP_PORT=587 <span className="text-slate-500">(587 pour TLS, 465 pour SSL)</span></div>
                <div>SMTP_USER="votre.email@wevioo.com" <span className="text-slate-500">(Email d'authentification)</span></div>
                <div>SMTP_PASS="vrai-app-password-ici" <span className="text-slate-500">(Mot de passe requis)</span></div>
                <div>SMTP_SECURE=false <span className="text-slate-500">(Mettre true pour le port SSL 465)</span></div>
                <div>SMTP_FROM="nepasrepondre.logistique@wevioo.com" <span className="text-slate-500">(Expéditeur)</span></div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-wevioo-blue text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
            <div>
              <p className="font-bold text-white">Astuce cruciale pour Gmail (Si vous utilisez un compte gmail)</p>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Google bloque la connexion avec votre mot de passe habituel. Vous <strong>devez</strong> activer l'authentification à deux facteurs (2FA) puis générer un <strong>Mot de passe d'application (App Password)</strong> pour que Nodemailer puisse s'y connecter de manière sécurisée.
              </p>
              <a 
                href="https://myaccount.google.com/apppasswords" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-wevioo-cyan hover:underline font-semibold mt-1"
              >
                <span>Générer un Mot de passe d'application Google</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
