/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Users, Upload, UserPlus, Trash2, RotateCcw, AlertCircle, 
  CheckCircle, FileText, Download, Sparkles, Database, UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee } from '../types';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';

interface EligibleManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function EligibleManager({ employees, setEmployees }: EligibleManagerProps) {
  // Input fields for adding a single employee
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleDept, setSingleDept] = useState('Digital & Technology');
  const [singleTitle, setSingleTitle] = useState('');
  const [singlePhone, setSinglePhone] = useState('');

  // Mass paste text
  const [bulkText, setBulkText] = useState(() => {
    // Generate initial prefilled text from current mock employees as an example helper
    return employees.map(e => `${e.name}, ${e.email}, ${e.title}`).join('\n');
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Extract initials for the avatar
  const getInitials = (fullname: string): string => {
    return fullname
      .split(' ')
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EM';
  };

  // Safe email matching helper
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Handle adding a single user
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!singleName.trim() || !singleEmail.trim()) {
      showNotification('error', 'Veuillez renseigner au moins le nom complet et l\'adresse email.');
      return;
    }

    if (!isValidEmail(singleEmail)) {
      showNotification('error', 'L\'adresse email n\'est pas valide.');
      return;
    }

    // Check duplicate email
    if (employees.some(emp => emp.email.toLowerCase() === singleEmail.trim().toLowerCase())) {
      showNotification('error', `L'adresse email "${singleEmail}" existe déjà dans l'annuaire.`);
      return;
    }

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const newEmp: Employee = {
      id: `wev-${randomIdNum}`,
      name: singleName.trim(),
      email: singleEmail.trim().toLowerCase(),
      title: singleTitle.trim() || 'Consultant',
      avatar: getInitials(singleName.trim()),
      ticketStatus: 'PENDING',
      phone: singlePhone.trim() || undefined
    };

    setEmployees(prev => [newEmp, ...prev]);
    showNotification('success', `Succès : ${newEmp.name} a été ajouté(e) à l'annuaire.`);

    // Reset single state
    setSingleName('');
    setSingleEmail('');
    setSingleTitle('');
    setSinglePhone('');
  };

  // Handle removing a single user
  const handleRemoveUser = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmer la suppression',
      message: `Voulez-vous vraiment retirer ${name} de la liste des éligibles Wevioo Tunis ? Il/Elle ne pourra plus retirer de carnets de tickets.`,
      onConfirm: () => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        showNotification('info', `${name} a été retiré(e) de la liste.`);
      }
    });
  };

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Helper for parsing raw pasted text and building valid Employee records
  const parseBulkText = (text: string): Employee[] => {
    const lines = text.split('\n');
    const parsed: Employee[] = [];
    const seenEmails = new Set<string>();

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Detect if pasted from Excel/Spreadsheets (uses Tab \t)
      const isTab = cleanLine.includes('\t');
      const parts = cleanLine.split(isTab ? '\t' : /[,;]/).map(p => p.trim());
      
      // Skip header rows if detected
      const isHeader = parts.some(p => {
        const lp = p.toLowerCase();
        return lp.includes('code salarié') || 
               lp.includes('nom et prénom') || 
               lp.includes('nombre de tr') || 
               lp === 'mail' ||
               lp === 'série' ||
               lp.includes('séquentielle') ||
               lp.includes('matricule');
      });
      if (isHeader) return;

      let email = '';
      let name = '';
      let id = '';
      let ticketCount = 19; // Default based on Wevioo May 2026 spreadsheet
      let sodexoCardNumber = '';
      let department = 'Digital & Technology';
      let title = 'Consultant';

      // If we have at least 4 tab columns (matching the Excel template)
      if (parts.length >= 4) {
        // According to template:
        // Col 0: Série Séquentielle (1)
        // Col 1: Code Salarié (OXI732)
        // Col 2: Nom et prénom (Abderrahmen MHEMED)
        // Col 3: Nombre de TR (19)
        // Col 4: Numéro de carnet list (optional)
        // Col 8: mail (abderrahmen.mhemed@wevioo.com)
        
        // We check if parts[0] is sequence number (small integer) and parts[1] contains the actual alphanumeric code
        const col0IsSeq = /^\s*\d+\s*$/.test(parts[0]) && parts[0].length <= 3;
        
        if (col0IsSeq && parts[1] && !/^\s*\d+\s*$/.test(parts[1])) {
          // Case A: Full Excel Row Copy (starts with a small sequential number/index)
          id = parts[1] || `wev-${Math.floor(1000 + Math.random() * 9000)}`;
          name = parts[2] || '';
          const rawTR = parseInt(parts[3], 10);
          if (!isNaN(rawTR)) {
            ticketCount = rawTR;
          }
          sodexoCardNumber = parts[4] || '';
        } else {
          // Case B: App/Web Generated copy format (where Col 0 is already Code Salarié)
          id = parts[0] || `wev-${Math.floor(1000 + Math.random() * 9000)}`;
          name = parts[1] || '';
          const rawTR = parseInt(parts[2], 10);
          if (!isNaN(rawTR)) {
            ticketCount = rawTR;
          }
          // The email will be found automatically by checking valid email in parts
        }

        // Find email by checking standard index or searching columns
        const foundEmail = parts.find(p => isValidEmail(p));
        if (foundEmail) {
          email = foundEmail.toLowerCase();
        } else if (parts[8] && isValidEmail(parts[8])) {
          email = parts[8].toLowerCase();
        } else if (parts[7] && isValidEmail(parts[7])) {
          email = parts[7].toLowerCase();
        } else if (parts[3] && isValidEmail(parts[3])) {
          email = parts[3].toLowerCase();
        } else if (name) {
          email = `${name.toLowerCase().replace(/\s+/g, '.')}@wevioo.com`;
        }
      } else {
        // Simple comma/semicolon separation or single email line
        const emailIndex = parts.findIndex(p => isValidEmail(p));
        if (emailIndex !== -1) {
          email = parts[emailIndex].toLowerCase();
          if (emailIndex === 0) {
            name = parts[1] || '';
          } else {
            name = parts[0] || '';
          }
          if (parts.length > 2) {
            const remainingParts = parts.filter((_, i) => i !== emailIndex && parts[i] !== name);
            if (remainingParts[0]) department = remainingParts[0];
            if (remainingParts[1]) title = remainingParts[1];
          }
        } else {
          name = parts[0] || '';
          email = `${parts[0].toLowerCase().replace(/\s+/g, '.')}@wevioo.com`;
          if (parts[1]) department = parts[1];
          if (parts[2]) title = parts[2];
        }
        id = `wev-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Generate random Code Salarié if not found/fallback
      if (!id || id === 'undefined' || id.toLowerCase().includes('série') || id.toLowerCase().includes('Code Salarié')) {
        id = `OXI${700 + index}`;
      }

      if (!name) {
        const local = email.split('@')[0];
        name = local.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      // Distribute departments nicely
      const departments = [
        "Digital & Technology",
        "Consulting & Strategy",
        "ERP & Business Intelligence",
        "Human Resources",
        "Finance & Administration"
      ];
      if (department === 'Digital & Technology' && index > 0) {
        department = departments[index % departments.length];
      }

      if (email && !seenEmails.has(email)) {
        seenEmails.add(email);
        parsed.push({
          id,
          name,
          email,
          title,
          avatar: getInitials(name),
          ticketStatus: 'PENDING',
          ticketCount,
          sodexoCardNumber: sodexoCardNumber || undefined
        });
      }
    });

    return parsed;
  };

  const handleApplyBulk = () => {
    try {
      const parsed = parseBulkText(bulkText);
      if (parsed.length === 0) {
        showNotification('error', 'Aucun collaborateur ou email valide n\'a été détecté dans votre saisie.');
        return;
      }

      setConfirmModal({
        isOpen: true,
        title: 'Mettre à jour l\'annuaire Wevioo',
        message: `Vous vous apprêtez à remplacer l'annuaire actuel par cette nouvelle liste de ${parsed.length} collaborateur(s). Tous les tickets précédemment retirés seront réinitialisés en "En attente". Continuer ?`,
        onConfirm: () => {
          setEmployees(parsed);
          showNotification('success', `L'annuaire de distribution Wevioo a été mis à jour avec succès (${parsed.length} éligibles).`);
        }
      });
    } catch (err) {
      showNotification('error', 'Erreur lors du traitement de la liste de données.');
    }
  };

  const processExcelFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
      showNotification('error', 'Veuillez sélectionner un fichier au format Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) {
          showNotification('error', 'Impossible de lire le contenu du fichier.');
          return;
        }

        // Parse Excel file as an ArrayBuffer - provides maximum compatibility and prevents garbled UTF-8 text characters
        const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get rows as arrays with option { header: 1 }
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rows.length === 0) {
          showNotification('error', 'Le fichier Excel est vide.');
          return;
        }

        const parsedEmployees: Employee[] = [];
        const seenEmails = new Set<string>();

        // Scan for header row
        let headerRowIndex = -1;
        // Default fallbacks precisely matching Wevioo typical columns
        let codeCol = 1;      // Column B (Code Salarié)
        let nameCol = 2;      // Column C (Nom et prénom)
        let trCol = 3;        // Column D (Nombre de TR)
        let sodexoCol = 4;    // Column E (Numéro de Carnet SODEXO)
        let mailCol = 8;      // Column I (mail)

        for (let i = 0; i < Math.min(25, rows.length); i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row)) continue;

          const rowStrings = row.map(cell => String(cell || '').toLowerCase().trim());
          
          const hasSalarie = rowStrings.some(s => s.includes('salarié') || s.includes('code s') || s.includes('matricule'));
          const hasNomPrenom = rowStrings.some(s => s.includes('nom') && (s.includes('prénom') || s.includes('prenom')));
          const hasTr = rowStrings.some(s => s.includes('nombre de tr') || s.includes('nb tr') || s.includes('nbr tr'));
          const hasMail = rowStrings.some(s => s === 'mail' || s.includes('email') || s.includes('courriel'));

          if (hasSalarie || hasNomPrenom || hasTr || hasMail) {
            headerRowIndex = i;
            rowStrings.forEach((val, idx) => {
              if (
                (val.includes('code') || val.includes('salarié') || val.includes('salarie') || val.includes('matricule')) &&
                !val.includes('série') && 
                !val.includes('serie') && 
                !val.includes('seq') && 
                !val.includes('séquence') && 
                !val.includes('sequence')
              ) {
                codeCol = idx;
              } else if (val.includes('nom') || val.includes('prénom') || val.includes('prenom')) {
                nameCol = idx;
              } else if (val.includes('nombre de tr') || val === 'tr' || val === 'nb tr' || val === 'nb de tr' || val === 'tr count') {
                trCol = idx;
              } else if (val.includes('mail') || val.includes('email') || val === 'courriel') {
                mailCol = idx;
              } else if (val.includes('carnet') || val.includes('numéro de carnet') || val.includes('sodexo')) {
                // Ignore matching Sodexo/Carnet if this is actually the TR column
                if (!val.includes('nombre') && !val.includes('nb ')) {
                  sodexoCol = idx;
                }
              }
            });
            break;
          }
        }

        const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
        
        let finalCodeCol = codeCol;
        // Let's refine the column mapping by inspecting the first few data rows to detect inverted sequence/code columns!
        if (rows.length > startIndex) {
          let codeColHasOnlySerials = true;
          let betterAlphanumericCol = -1;
          let sampleRowUsed = 0;

          for (let s = startIndex; s < Math.min(startIndex + 10, rows.length); s++) {
            const r = rows[s];
            if (!r || !Array.isArray(r)) continue;
            sampleRowUsed++;
            const codeVal = String(r[finalCodeCol] || '').trim();
            // A local sequential serial usually matches a small integer (<= 1000)
            const codeValueNum = Number(codeVal);
            if (!codeVal || isNaN(codeValueNum) || codeValueNum > 1000 || codeVal.includes('-') || codeVal.includes('OXI')) {
              codeColHasOnlySerials = false;
            }

            // Search other columns in this row for standard employee code patterns
            r.forEach((cell, idx) => {
              if (idx === finalCodeCol) return;
              const cellStr = String(cell || '').trim();
              if (
                cellStr.toUpperCase().startsWith('OXI') || 
                /^[A-Z]{3,4}\d+/i.test(cellStr) ||
                (/^[A-Z0-9-]{4,12}$/i.test(cellStr) && isNaN(Number(cellStr)))
              ) {
                if (betterAlphanumericCol === -1 || betterAlphanumericCol === idx) {
                  betterAlphanumericCol = idx;
                }
              }
            });
          }

          if (codeColHasOnlySerials && betterAlphanumericCol !== -1 && sampleRowUsed > 0) {
            console.log(`[Auto-Correction] Detected serial index in Code column ${finalCodeCol}. Automatically switching to alphanumeric candidate Column ${betterAlphanumericCol}.`);
            finalCodeCol = betterAlphanumericCol;
          }
        }

        console.log(`[TunisDesk Excel Engine] Header found at row index ${headerRowIndex}. Column Mapping: Code=${finalCodeCol} (original: ${codeCol}), Name=${nameCol}, TR=${trCol}, SodexoID=${sodexoCol}, Email=${mailCol}`);

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          // Safe extraction
          const codeRaw = row[finalCodeCol] !== undefined ? String(row[finalCodeCol]).trim() : '';
          const nameRaw = row[nameCol] !== undefined ? String(row[nameCol]).trim() : '';
          const trRaw = row[trCol] !== undefined ? String(row[trCol]).trim() : '';
          const mailRaw = row[mailCol] !== undefined ? String(row[mailCol]).trim() : '';
          const sodexoRaw = row[sodexoCol] !== undefined ? String(row[sodexoCol]).trim() : '';

          // Skip completely empty spacer rows
          if (!nameRaw && !mailRaw && !codeRaw) continue;

          // Skip re-headers or total footers (fully case-insensitive, ignores spacing/accents)
          const nameClean = nameRaw.toLowerCase().replace(/\s+/g, ' ').trim();
          const codeClean = codeRaw.toLowerCase().replace(/\s+/g, ' ').trim();
          
          if (
            nameClean.includes('nom et pr') || 
            nameClean.includes('nom et prénom') ||
            nameClean.includes('nom et prenom') ||
            nameClean.includes('nom & prénom') ||
            nameClean === 'nom' ||
            nameClean === 'collaborateur' ||
            nameClean.includes('total général') || 
            nameClean.includes('total general') ||
            nameClean.includes('global summary') ||
            nameClean.includes('collaborateur wevioo') ||
            codeClean.includes('code') || 
            codeClean.includes('matricule') ||
            codeClean.includes('salarie') ||
            codeClean.includes('salarié') ||
            codeClean.includes('série') ||
            codeClean.includes('serie')
          ) {
            continue;
          }

          let email = mailRaw;
          if (!email && isValidEmail(nameRaw)) {
            email = nameRaw;
          }
          email = email.toLowerCase().trim();

          // If no email exists, generate one from the name, stripping accents
          if (!email || !isValidEmail(email)) {
            if (nameRaw && nameRaw.length > 2) {
              const cleanName = nameRaw
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Remove accents
                .toLowerCase()
                .replace(/[^a-z0-9\s.-]/g, '') // Keep letters/numbers/dots/spaces
                .trim();
              email = `${cleanName.replace(/\s+/g, '.')}@wevioo.com`;
            } else {
              continue; // Skip lines with no usable name and invalid email
            }
          }

          if (seenEmails.has(email)) continue;
          seenEmails.add(email);

          let ticketCount = parseInt(trRaw, 10);
          if (isNaN(ticketCount)) ticketCount = 19;

          let id = codeRaw;
          if (!id || id === 'undefined' || codeClean.includes('série') || codeClean.includes('serie') || codeClean.includes('code salarié') || codeClean.includes('code salarie') || codeClean.includes('matricule')) {
            id = `OXI${700 + i}`;
          }

          const initials = getInitials(nameRaw || 'Collaborateur');
          const departments = [
            "Digital & Technology",
            "Consulting & Strategy",
            "ERP & Business Intelligence",
            "Human Resources",
            "Finance & Administration"
          ];
          const department = departments[i % departments.length];

          parsedEmployees.push({
            id: id,
            name: nameRaw || 'Collaborateur Wevioo',
            email: email,
            title: "Collaborateur",
            avatar: initials,
            ticketStatus: 'PENDING',
            ticketCount: ticketCount,
            sodexoCardNumber: sodexoRaw || undefined
          });
        }

        if (parsedEmployees.length === 0) {
          showNotification('error', 'Aucun collaborateur éligible valide n\'a pu être extrait de ce fichier.');
          return;
        }

        setConfirmModal({
          isOpen: true,
          title: 'Importer le fichier Excel',
          message: `Vous vous apprêtez à remplacer l'annuaire actuel par les ${parsedEmployees.length} collaborateurs importés depuis le fichier Excel "${file.name}". Confirmer ?`,
          onConfirm: () => {
            setEmployees(parsedEmployees);
            showNotification('success', `Importation Excel réussie ! ${parsedEmployees.length} collaborateurs Wevioo Tunis ont été chargés.`);

            // Pre-fill the bulk text view for editing/copying purposes
            const excelFormattedText = parsedEmployees.map(e => `${e.id}\t${e.name}\t${e.ticketCount || 19}\t${e.email}`).join('\n');
            setBulkText(excelFormattedText);
          }
        });
      } catch (err) {
        console.error('[Excel Engine Parse Error]:', err);
        showNotification('error', 'Erreur lors du traitement du fichier Excel. Vérifiez le format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleResetToDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurer la Démo Wevioo',
      message: 'Voulez-vous restaurer l\'annuaire initial de démonstration de 12 collaborateurs Wevioo Tunis ?',
      onConfirm: () => {
        setEmployees(INITIAL_EMPLOYEES);
        setBulkText(INITIAL_EMPLOYEES.map(e => `${e.name}, ${e.email}, ${e.title}`).join('\n'));
        showNotification('info', 'L\'annuaire par défaut a été restauré avec succès.');
      }
    });
  };

  // Preview counts based on current bulk text typing
  const liveParsedCount = parseBulkText(bulkText).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6" id="eligibles-manager">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-wevioo-blue tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-wevioo-cyan" />
            Gestion de la liste des éligibles (Sodexo Wevioo)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ajoutez de nouveaux arrivants, retirez des collaborateurs ou importez l'intégralité d'un nouveau fichier d'éligibilité.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleResetToDemo}
            className="text-xs font-semibold flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurer Démo Wevioo
          </button>
        </div>
      </div>

      {/* Notifications Alert */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm transition-all duration-300 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
          'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{notification.message}</div>
        </div>
      )}

      {/* Excel/CSV File Dropzone / Uploader */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-gradient-to-br rounded-2xl p-6 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3.5 group cursor-pointer relative shadow-sm ${
          isDragging 
            ? 'border-wevioo-cyan bg-wevioo-cyan/5 scale-[0.99] shadow-inner' 
            : 'from-slate-50 to-slate-100/60 border-slate-300 hover:border-wevioo-cyan hover:bg-slate-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleExcelFileUpload} 
          accept=".xlsx,.xls,.csv" 
          className="hidden" 
        />
        <div className="w-11 h-11 rounded-xl bg-wevioo-blue/5 text-wevioo-blue flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
          <FileSpreadsheet className="w-6 h-6 text-wevioo-cyan" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 text-sm">Importer votre fichier Excel ({`XLSX / XLS / CSV`})</h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            Cliquez pour charger ou glissez-déposez votre classeur Wevioo. Le système détecte automatiquement l'en-tête et associe les colonnes : <strong className="text-wevioo-blue font-bold">Code Salarié, Nom et prénom, Nombre de TR, mail</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center text-[10px] font-mono font-bold">
          <span className="bg-white border text-slate-400 px-2 py-0.5 rounded shadow-sm">Col 1: Série Séquentielle</span>
          <span className="bg-white border border-wevioo-blue/20 text-wevioo-blue px-2 py-0.5 rounded shadow-sm">Col 2: Code Salarié (Ex: OXI732)</span>
          <span className="bg-white border border-wevioo-blue/20 text-wevioo-blue px-2 py-0.5 rounded shadow-sm">Col 3: Nom et prénom</span>
          <span className="bg-white border border-wevioo-cyan/20 text-wevioo-cyan px-2 py-0.5 rounded shadow-sm">Col 4: Nombre de TR</span>
          <span className="bg-white border text-slate-400 px-2 py-0.5 rounded shadow-sm">Col 5–8: Divers Wevioo</span>
          <span className="bg-white border border-wevioo-blue/20 text-wevioo-blue px-2 py-0.5 rounded shadow-sm font-semibold">Col 9: mail</span>
        </div>
      </div>

      {/* Inputs grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bulk Area Left */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-wevioo-blue" />
              Import en Masse (Copier-Coller)
            </h3>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-mono font-bold px-2 py-0.5 rounded-md">
              CSV / RAW TEXT
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Collez une liste d'adresses emails (ou ligne formatée: <code className="bg-white px-1 border rounded text-slate-700">Nom Complet, email@wevioo.com, Service, Titre</code>). Chaque ligne créera un collaborateur.
          </p>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full h-48 p-3 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wevioo-blue/10 focus:border-wevioo-blue leading-relaxed resize-none scrollbar-thin"
            placeholder={`Exemples :
amal.benmabrouk@wevioo.com
Mohamed Ali, mohamed.ali@wevioo.com
Khaled Dridi, khaled.dridi@wevioo.com, Digital & Technology, Senior Dev`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-wevioo-cyan animate-pulse" />
              <span>Analysé :</span>
              <strong className="text-slate-800">{liveParsedCount} collaborateur(s) détecté(s)</strong>
            </div>

            <button
              onClick={handleApplyBulk}
              type="button"
              className="py-2.5 px-4 bg-wevioo-blue hover:bg-wevioo-blue/90 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Écraser & Appliquer la liste
            </button>
          </div>
        </div>

        {/* Single Add Area Right */}
        <form onSubmit={handleAddSingle} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-wevioo-blue" />
            Ajouter un Collaborateur Individuel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Nom Complet *</label>
              <input
                type="text"
                required
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="Ex. Amira Ben Romdhane"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-wevioo-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Adresse Email Wevioo *</label>
              <input
                type="email"
                required
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="amira.benromdhane@wevioo.com"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-wevioo-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Département Wevioo</label>
              <select
                value={singleDept}
                onChange={(e) => setSingleDept(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-wevioo-blue cursor-pointer"
              >
                <option value="Digital & Technology">Digital & Technology</option>
                <option value="Consulting & Strategy">Consulting & Strategy</option>
                <option value="ERP & Business Intelligence">ERP & Business Intelligence</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Administration">Finance & Administration</option>
                <option value="Marketing & Communication">Marketing & Communication</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Poste de travail</label>
              <input
                type="text"
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
                placeholder="Ex. Ingénieur d'études / Manager"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-wevioo-blue"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-500 font-medium">Téléphone (Optionnel)</label>
              <input
                type="text"
                value={singlePhone}
                onChange={(e) => setSinglePhone(e.target.value)}
                placeholder="+216 XX XXX XXX"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-wevioo-blue"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 bg-gradient-to-r from-wevioo-blue to-wevioo-cyan hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Ajouter à l'annuaire
            </button>
          </div>
        </form>

      </div>

      {/* Eligible List Viewer Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-wevioo-cyan" />
            Éligibles Actuels dans la Base de Données ({employees.length})
          </h4>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white max-h-96 overflow-y-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-3">Collaborateur</th>
                <th className="p-3 text-center">Matricule</th>
                <th className="p-3 text-center bg-wevioo-cyan/5 text-wevioo-blue">Nombre de TR</th>
                <th className="p-3 text-center">Statut Ticket</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun collaborateur trouvé. Utilisez le formulaire ou le module de texte pour importer.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
            
                    <td className="p-3 text-center font-mono font-medium text-slate-500">
                      {emp.id}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700 font-mono bg-wevioo-cyan/5">
                      <span className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-wevioo-cyan/20 text-wevioo-blue text-xs font-black shadow-sm">
                        {emp.ticketCount || 19}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {emp.ticketStatus === 'COLLECTED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Retiré
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          En Attente
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveUser(emp.id, emp.name)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Retirer ce collaborateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal for Iframe compatibility */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-wevioo-blue hover:bg-wevioo-blue/90 text-white font-extrabold rounded-xl transition-all text-xs"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
