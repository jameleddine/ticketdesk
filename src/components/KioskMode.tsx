/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, Users, Sparkles, Signature, ArrowRight, ArrowLeft, CheckCircle, 
  Search, ShieldAlert, Award, Coffee, HelpCircle, Mail, MapPin, ExternalLink 
} from 'lucide-react';
import { Employee } from '../types';
import SignaturePad from './SignaturePad';

interface KioskModeProps {
  employees: Employee[];
  onConfirmDelivery: (
    pickerId: string, 
    targets: { id: string; name: string; email: string; type: 'SELF' | 'FRIEND' }[], 
    signatureUrl: string
  ) => void;
}

export default function KioskMode({ employees, onConfirmDelivery }: KioskModeProps) {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Select Self, 2: Select Mode, 3: Select Friend (conditional), 4: Signature, 5: Success
  const [searchPicker, setSearchPicker] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  
  // Selected state
  const [selectedSelf, setSelectedSelf] = useState<Employee | null>(null);
  const [pickupMode, setPickupMode] = useState<'SELF' | 'FRIEND' | 'BOTH' | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Employee | null>(null);
  const [signature, setSignature] = useState('');

  // Dropdown list for self
  const availablePickers = employees.filter(e => 
    e.name.toLowerCase().includes(searchPicker.toLowerCase()) ||
    e.email.toLowerCase().includes(searchPicker.toLowerCase())
  );

  // Dropdown list for friend (should exclude the selected picker)
  const availableFriends = employees.filter(e => 
    e.id !== selectedSelf?.id && 
    (e.name.toLowerCase().includes(searchFriend.toLowerCase()) || e.email.toLowerCase().includes(searchFriend.toLowerCase()))
  );

  // Restart Kiosk Flow
  const handleResetKiosk = () => {
    setStep(0);
    setSearchPicker('');
    setSearchFriend('');
    setSelectedSelf(null);
    setPickupMode(null);
    setSelectedFriend(null);
    setSignature('');
  };

  // Submit delivery
  const handleConfirmSubmit = () => {
    if (!selectedSelf || !pickupMode || !signature) return;

    const targets: { id: string; name: string; email: string; type: 'SELF' | 'FRIEND' }[] = [];

    if (pickupMode === 'SELF' || pickupMode === 'BOTH') {
      targets.push({
        id: selectedSelf.id,
        name: selectedSelf.name,
        email: selectedSelf.email,
        type: 'SELF'
      });
    }

    if (pickupMode === 'FRIEND' || pickupMode === 'BOTH') {
      if (selectedFriend) {
        targets.push({
          id: selectedFriend.id,
          name: selectedFriend.name,
          email: selectedFriend.email,
          type: 'FRIEND'
        });
      }
    }

    onConfirmDelivery(selectedSelf.id, targets, signature);
    setStep(5); // Show success screen
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col min-h-[580px] justify-between">
      
      {/* STEP 0: Welcome Display */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF6B35]/20 blur-2xl rounded-full scale-125" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1A3B8B] to-[#00A4E4] flex items-center justify-center text-white text-3xl font-black shadow-lg">
              W
            </div>
          </div>

          <div className="space-y-2 max-w-lg">
            <span className="text-xs bg-slate-100 hover:bg-slate-200 text-[#1A3B8B] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border border-slate-200">
              Kiosque d'Accueil — Wevioo Tunisie 🇹🇳
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A3B8B] font-sans">
              Retrait des Tickets Restaurant
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Bienvenue au Welcome Desk de Wevioo. Signez la réception de vos tickets repas en quelques étapes simples. Notification automatique sécurisée par email.
            </p>
          </div>

          <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF6B35] shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Service Logistique Interne</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pour toute réclamation, veuillez contacter le secrétariat ou l'Office Manager au Centre Urbain Nord, Tunis.</p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            type="button"
            className="w-full max-w-sm py-4 bg-[#1A3B8B] hover:bg-[#1A3B8B]/95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Démarrer le retrait</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 1: Select Self (Who is picking up?) */}
      {step === 1 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
              <span>Étape 1 sur 4</span>
              <span>•</span>
              <span className="text-[#FF6B35]">Identification</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1A3B8B]">Qui êtes-vous ?</h2>
              <p className="text-xs text-slate-500">
                Recherchez votre compte Active Directory et sélectionnez votre nom dans la liste des collaborateurs Wevioo.
              </p>
            </div>

            {/* Selector */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email wevioo..."
                value={searchPicker}
                onChange={(e) => setSearchPicker(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A3B8B] text-sm focus:ring-2 focus:ring-[#1A3B8B]/10"
              />
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white">
              {availablePickers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Aucun membre trouvé correspondant à cette recherche.
                </div>
              ) : (
                availablePickers.map((emp) => {
                  const isSelected = selectedSelf?.id === emp.id;
                   return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedSelf(emp)}
                      className={`w-full text-left p-3.5 flex items-center justify-between transition-all ${isSelected ? 'bg-[#1A3B8B]/5 text-[#1A3B8B]' : 'hover:bg-slate-50/70'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelected ? 'bg-[#1A3B8B]' : 'bg-[#00A4E4]'}`}>
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-mono">{emp.department}</span>
                        {emp.ticketStatus === 'COLLECTED' && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium">Déjà retiré</span>
                        )}
                        {isSelected && <CheckCircle className="w-5 h-5 text-[#1A3B8B]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => { setStep(0); setSelectedSelf(null); }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            <button
              disabled={!selectedSelf}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-[#1A3B8B] hover:bg-[#1A3B8B]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-sm flex items-center gap-1.5"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Mode */}
      {step === 2 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
              <span>Étape 2 sur 4</span>
              <span>•</span>
              <span className="text-[#1A3B8B]">Option de Retrait</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1A3B8B]">Choisissez votre option de retrait</h2>
              <p className="text-xs text-slate-500">
                Sachez que vous pouvez également récupérer les bons de restauration pour d'autres collègues directement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1 */}
              <button
                onClick={() => { setPickupMode('SELF'); setSelectedFriend(null); }}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${pickupMode === 'SELF' ? 'border-[#1A3B8B] bg-[#1A3B8B]/5 ring-2 ring-[#1A3B8B]/10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#1A3B8B]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Mon Ticket Uniquement</h3>
                  <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">Je récupère mon propre carnet de tickets repas wevioo pour ce mois.</p>
                </div>
              </button>

              {/* Option 2 */}
              <button
                onClick={() => setPickupMode('FRIEND')}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${pickupMode === 'FRIEND' ? 'border-[#FF6B35] bg-[#FF6B35]/5 ring-2 ring-[#FF6B35]/10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6B35]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Pour un(e) Collègue</h3>
                  <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">Je retire uniquement le carnet d'un ami. Il recevra un email de confirmation.</p>
                </div>
              </button>

              {/* Option 3 */}
              <button
                onClick={() => setPickupMode('BOTH')}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${pickupMode === 'BOTH' ? 'border-[#00A4E4] bg-[#00A4E4]/5 ring-2 ring-[#00A4E4]/10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#00A4E4]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Mon Ticket + Collègue</h3>
                  <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">Je récupère mon ticket et celui de mon ami en même temps.</p>
                </div>
              </button>
            </div>
            
            {/* Informative Note */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Conformément à la politique logistique de Wevioo, toute transaction effectuée pour le compte de tiers génère des notifications automatiques envoyées par mail aux deux parties afin de garantir la transparence.</span>
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => { setStep(1); setPickupMode(null); }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            <button
              disabled={!pickupMode}
              onClick={() => {
                if (pickupMode === 'SELF') {
                  setStep(4); // Skip Friend Selection, go straight to signature
                } else {
                  setStep(3); // Go to friend list selection
                }
              }}
              className="px-6 py-3 rounded-xl bg-[#1A3B8B] hover:bg-[#1A3B8B]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-sm flex items-center gap-1.5"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Friend */}
      {step === 3 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
              <span>Étape 3 sur 4</span>
              <span>•</span>
              <span className="text-[#FF6B35]">Sélection du Collègue</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1A3B8B]">Quel ami ou collègue Wevioo ?</h2>
              <p className="text-xs text-slate-500">
                Sélectionnez le collaborateur dont vous allez récupérer le bon de restaurant.
              </p>
            </div>

            {/* Selector */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher le collègue par son nom ou email..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A3B8B] text-sm focus:ring-2 focus:ring-[#1A3B8B]/10"
              />
            </div>

            {/* List of friends */}
            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white">
              {availableFriends.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Aucun membre trouvé correspondant à cette recherche.
                </div>
              ) : (
                availableFriends.map((emp) => {
                  const isSelected = selectedFriend?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedFriend(emp)}
                      className={`w-full text-left p-3.5 flex items-center justify-between transition-all ${isSelected ? 'bg-orange-500/5 text-[#FF6B35]' : 'hover:bg-slate-50/70'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-slate-400`}>
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{emp.department}</span>
                        {emp.ticketStatus === 'COLLECTED' && (
                          <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-mono">Retiré</span>
                        )}
                        {isSelected && <CheckCircle className="w-5 h-5 text-[#FF6B35]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-6 border-t border-slate-100">
            <button
               onClick={() => { setStep(2); setSelectedFriend(null); }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            <button
              disabled={!selectedFriend}
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-[#1A3B8B] hover:bg-[#1A3B8B]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-sm flex items-center gap-1.5"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Digital Signature */}
      {step === 4 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
              <span>Étape 4 sur 4</span>
              <span>•</span>
              <span className="text-indigo-600">Confirmation & Signature</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1A3B8B]">Réception sécurisée & Émargement</h2>
              <p className="text-xs text-slate-500">
                Veuillez émarger ci-dessous. En validant, un rapport de livraison numérique sera généré.
              </p>
            </div>

            {/* Recap */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Récapitulatif de Retrait</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
                {/* Picker details */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Retiré par (Signataire) :</p>
                  <p className="font-bold text-xs text-slate-800">{selectedSelf?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedSelf?.email}</p>
                </div>

                {/* Voucher targets details */}
                <div className="sm:pl-4 space-y-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Carnets de Bons concernés :</p>
                  
                  <div className="space-y-1.5">
                    {(pickupMode === 'SELF' || pickupMode === 'BOTH') && selectedSelf && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded">
                        <span className="w-2 h-2 rounded-full bg-[#1A3B8B]"></span>
                        <span>{selectedSelf.name} <span className="text-[10px] text-slate-400 font-normal">(Moi-même)</span></span>
                      </div>
                    )}
                    {(pickupMode === 'FRIEND' || pickupMode === 'BOTH') && selectedFriend && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
                        <span>{selectedFriend.name} <span className="text-[10px] text-amber-500 font-semibold">(Collègue)</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Alert Banner */}
              <div className="bg-amber-500/5 text-amber-800/90 text-[10px] font-semibold p-3.5 rounded-lg flex items-center gap-2 border border-amber-500/15">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {pickupMode === 'SELF' && `Vous recevrez un mail de livraison à l'adresse wevioo.`}
                  {pickupMode === 'FRIEND' && `Votre collègue ${selectedFriend?.name} recevra un email immédiatement confirmant la livraison par vos soins.`}
                  {pickupMode === 'BOTH' && `Vous recevrez votre mail ET ${selectedFriend?.name} recevra un mail notifiant sa livraison déléguée.`}
                </span>
              </div>
            </div>

            {/* Signature Pad */}
            <SignaturePad 
              onSave={(dataUrl) => setSignature(dataUrl)} 
              onClear={() => setSignature('')}
              placeholderText={`Émargement tactile pour ${selectedSelf?.name}`}
            />
          </div>

          <div className="flex gap-3 justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                if (pickupMode === 'SELF') {
                  setStep(2);
                } else {
                  setStep(3);
                }
                setSignature('');
              }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            <button
              disabled={!signature}
              onClick={handleConfirmSubmit}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1A3B8B] to-[#FF6B35] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-1.5"
            >
              Confirmer & Envoyer les Mails
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success Display */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Carnets de Bons Distribués avec Succès !</h2>
            <p className="text-sm text-slate-500">
              La transaction a été validée pour le personnel de Wevioo. Les emails d'accompagnement ont été envoyés avec succès via Wevioo SMTP Relay.
            </p>
          </div>

          {/* Electronic Receipt */}
          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-5 text-left font-mono text-xs space-y-3 relative overflow-hidden">
            {/* Stamp BG */}
            <div className="absolute -right-8 -bottom-8 opacity-10 font-bold scale-150 text-[#1A3B8B] rotate-12 select-none pointer-events-none">WEVIOO</div>

            <div className="border-b border-dashed border-slate-200 pb-2.5 flex justify-between text-slate-400">
              <span>RECEPTION DES CARNETS</span>
              <span>WEVIOO-TUNIS</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">SIGNATAIRE :</span>
                <span className="font-bold text-slate-700">{selectedSelf?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MEMBRE ID :</span>
                <span className="font-bold text-slate-700">{selectedSelf?.id}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-750">
                <span className="text-slate-400">HORODATAGE :</span>
                <span>{new Date().toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CARNET RETIRE :</span>
                <span className="font-bold text-emerald-600">{pickupMode === 'SELF' ? 'PROPRE CARNET' : pickupMode === 'FRIEND' ? 'CARNET AMI' : 'DEUX CARNETS'}</span>
              </div>
              {selectedFriend && (
                <div className="flex justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-slate-400">POUR COLLÈGUE :</span>
                  <span className="font-bold text-[#FF6B35]">{selectedFriend.name}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-2.5 flex justify-between items-center text-[10px] text-slate-400">
              <span>STATUT NOTIF SMTP :</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-sans font-bold flex items-center gap-1">
                <Mail className="w-3 h-3" /> ENVOYÉ
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={handleResetKiosk}
              type="button"
              className="py-3 px-8 bg-[#1A3B8B] hover:bg-[#1A3B8B]/95 text-white font-bold rounded-xl transition-all shadow text-sm"
            >
              Nouveau Retrait (Kiosque)
            </button>
            <a
              href="#active-directory"
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5"
            >
              Consulter l'Annuaire
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
