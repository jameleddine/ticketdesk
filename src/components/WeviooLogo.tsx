/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WeviooLogoProps {
  dark?: boolean;
  className?: string;
}

export default function WeviooLogo({ dark = false, className = '' }: WeviooLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Wevioo Corporate Logo */}
      <img
        src="https://wevioo.com/wp-content/uploads/2025/12/logowevioo.svg"
        alt="Wevioo Logo"
        className={`h-9 w-auto object-contain shrink-0 transition-opacity ${dark ? 'brightness-0 invert opacity-95' : ''}`}
        referrerPolicy="no-referrer"
      />
      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
        dark 
          ? 'bg-wevioo-cyan/25 border border-wevioo-cyan/30 text-wevioo-cyan' 
          : 'bg-wevioo-blue/10 border border-wevioo-blue/15 text-wevioo-blue'
      }`}>
        Tunis HQ
      </span>
    </div>
  );
}
