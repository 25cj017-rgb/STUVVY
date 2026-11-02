'use client';

import React, { useState } from 'react';
import { X, Database, Server, Cpu, ShieldCheck, Copy, Check } from 'lucide-react';
import { POSTGRES_SCHEMA_SQL, ARCHITECTURE_OVERVIEW } from '../data/dbSchema';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'architecture'>('schema');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gray-900 text-gray-100 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Stuvvy Technical Architecture Specs</h3>
              <p className="text-[11px] text-gray-400">PostgreSQL DDL & Infrastructure Overview</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-700/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-950 px-4">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL DDL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Tech Stack & 3G Low Bandwidth</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'schema' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 font-mono text-[11px]">schema.sql (PostgreSQL 16)</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] bg-orange-600/30 text-orange-300 hover:bg-orange-600/50 px-2.5 py-1 rounded-lg border border-orange-500/30 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
                </button>
              </div>
              <pre className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto">
                {POSTGRES_SCHEMA_SQL}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                <h4 className="font-extrabold text-orange-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Full-Stack Technology Stack</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li><strong className="text-white">Frontend:</strong> {ARCHITECTURE_OVERVIEW.stack.frontend}</li>
                  <li><strong className="text-white">Backend APIs:</strong> {ARCHITECTURE_OVERVIEW.stack.backend}</li>
                  <li><strong className="text-white">Database:</strong> {ARCHITECTURE_OVERVIEW.stack.database}</li>
                  <li><strong className="text-white">Authentication:</strong> {ARCHITECTURE_OVERVIEW.stack.auth}</li>
                  <li><strong className="text-white">Payments:</strong> {ARCHITECTURE_OVERVIEW.stack.payments}</li>
                  <li><strong className="text-white">Infrastructure:</strong> {ARCHITECTURE_OVERVIEW.stack.infrastructure}</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                <h4 className="font-extrabold text-amber-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3G Low-Bandwidth Optimization Features</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-300">
                  {ARCHITECTURE_OVERVIEW.lowBandwidthOptimization.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 text-right">
          <button
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
