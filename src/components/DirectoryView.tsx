/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Check, Clock, User, Award, RefreshCw, Layers } from 'lucide-react';
import { Employee } from '../types';

interface DirectoryViewProps {
  employees: Employee[];
  onResetStatus: (employeeId: string) => void;
  onResetAll: () => void;
}

export default function DirectoryView({ employees, onResetStatus, onResetAll }: DirectoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Gather unique departments
  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  // Filtering
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.id.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'PENDING' && e.ticketStatus === 'PENDING') ||
                          (statusFilter === 'COLLECTED' && e.ticketStatus === 'COLLECTED');

    return matchesSearch && matchesDept && matchesStatus;
  });

  // KPI Metrics
  const totalCount = employees.length;
  const collectedCount = employees.filter(e => e.ticketStatus === 'COLLECTED').length;
  const pendingCount = totalCount - collectedCount;
  const collectionRate = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
      {/* Top section with title and global reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#1A3B8B] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF6B35]" />
            Annuaire Actif & Statut des Tickets (Active Directory)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualisez et gérez l'état de livraison des bons de restauration pour le personnel de Wevioo Tunis.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onResetAll}
            className="text-xs font-semibold flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-[#1A3B8B]/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser Tous les Tickets
          </button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#1A3B8B]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Membres AD</p>
            <p className="text-2xl font-black text-slate-800">{totalCount}</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distribués</p>
            <p className="text-2xl font-black text-slate-800">{collectedCount}</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En Attente</p>
            <p className="text-2xl font-black text-slate-800">{pendingCount}</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de Retrait</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-800">{collectionRate}%</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full max-w-[80px]">
                <div 
                  className="h-full bg-gradient-to-r from-[#1A3B8B] to-[#FF6B35] rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters interface */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1A3B8B] focus:ring-2 focus:ring-[#1A3B8B]/10 text-sm transition-all"
          />
        </div>

        {/* Dept Filter */}
        <div className="relative md:w-56">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1A3B8B] focus:ring-2 focus:ring-[#1A3B8B]/10 text-sm appearance-none bg-white transition-all cursor-pointer"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'Tous les Départements' : dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-4 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1A3B8B] focus:ring-2 focus:ring-[#1A3B8B]/10 text-sm appearance-none bg-white transition-all cursor-pointer"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="PENDING">En Attente ⏳</option>
            <option value="COLLECTED">Livré ✅</option>
          </select>
        </div>
      </div>

      {/* Employees Table Grid */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
              <th className="p-4">Matricule</th>
              <th className="p-4">Collaborateur / Email</th>
              <th className="p-4">Département & Rôle</th>
              <th className="p-4">Statut Ticket</th>
              <th className="p-4">Détails Retrait</th>
              <th className="p-4 text-center">Actions POC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400">
                  Aucun collaborateur ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500 font-medium">
                    {emp.id}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A3B8B] to-[#00A4E4] flex items-center justify-center font-bold text-white text-xs">
                        {emp.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{emp.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700 text-xs">{emp.department}</div>
                    <div className="text-xs text-slate-400">{emp.title}</div>
                  </td>
                  <td className="p-4">
                    {emp.ticketStatus === 'COLLECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Livré
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        En Attente
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    {emp.ticketStatus === 'COLLECTED' ? (
                      <div className="space-y-1 text-slate-500">
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                          {emp.collectedAt}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Retiré par : <span className="font-semibold text-slate-600">{emp.collectedBy}</span>
                        </div>
                        {emp.signatureUrl && (
                          <div className="mt-1 flex items-center gap-1 border border-slate-200 bg-white p-1 rounded w-24">
                            <img 
                              src={emp.signatureUrl} 
                              alt="Signature" 
                              className="h-6 w-auto max-w-full object-contain mx-auto" 
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {emp.ticketStatus === 'COLLECTED' && (
                      <button
                        onClick={() => onResetStatus(emp.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors border border-slate-200 hover:border-rose-200"
                        title="Marquer comme non collecté pour retester"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
