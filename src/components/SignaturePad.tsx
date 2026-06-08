/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, CheckCircle, AlertTriangle } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  placeholderText?: string;
}

export default function SignaturePad({ onSave, onClear, placeholderText = "Veuillez signer ici / Please sign here" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#1A3B8B'); // Wevioo Blue

  // Initialize canvas with correct DPI scale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Scale for high-resolution displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Smooth lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = penColor;

    // Reset drawn indicator
    setHasDrawn(false);
  }, []);

  // Update pen color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor;
    }
  }, [penColor]);

  // Drawing Logic (Mouse & Touch)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Determine if touch event or mouse event
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      const mouseEvent = e as MouseEvent | React.MouseEvent;
      return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling when signing on mobile touch devices
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSave(''); // trigger clear status
    if (onClear) onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Output Base64 string representing the signature
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#FF6B35]" />
          <span>Signature tactile requise / Signature required</span>
        </label>
        
        <div className="flex items-center space-x-2">
          {/* Colors */}
          <button
            type="button"
            onClick={() => setPenColor('#1A3B8B')}
            className={`w-5 h-5 rounded-full border ${penColor === '#1A3B8B' ? 'ring-2 ring-offset-1 ring-[#1A3B8B]' : ''}`}
            style={{ backgroundColor: '#1A3B8B' }}
            title="Wevioo Royal Blue"
          />
          <button
            type="button"
            onClick={() => setPenColor('#FF6B35')}
            className={`w-5 h-5 rounded-full border ${penColor === '#FF6B35' ? 'ring-2 ring-offset-1 ring-[#FF6B35]' : ''}`}
            style={{ backgroundColor: '#FF6B35' }}
            title="Wevioo Active Orange"
          />
          <button
            type="button"
            onClick={() => setPenColor('#0B132B')}
            className={`w-5 h-5 rounded-full border ${penColor === '#0B132B' ? 'ring-2 ring-offset-1 ring-[#0B132B]' : ''}`}
            style={{ backgroundColor: '#0B132B' }}
            title="Classic Charcoal dark"
          />
          
          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            id="clear-btn"
            type="button"
            onClick={clearCanvas}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Effacer
          </button>
        </div>
      </div>

      <div className="relative w-full h-44 border-2 border-dashed border-slate-200 hover:border-[#1A3B8B]/40 rounded-xl bg-white transition-colors overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none absolute top-0 left-0 z-10"
        />

        {/* Placeholder overlay when not drawn */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none text-slate-400 select-none z-0">
            <p className="text-sm font-medium">{placeholderText}</p>
            <p className="text-xs text-slate-400 mt-1">Utilisez votre doigt ou votre souris pour signer</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs px-1">
        {hasDrawn ? (
          <span className="text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Signature détectée
          </span>
        ) : (
          <span className="text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Une signature manuelle est requise pour valider
          </span>
        )}
        <span className="text-slate-400 font-mono">TunisDesk Secure Signature</span>
      </div>
    </div>
  );
}
