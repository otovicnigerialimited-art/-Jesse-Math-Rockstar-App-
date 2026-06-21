import React from 'react';
import FamilyCredits from './FamilyCredits';
import { Award } from 'lucide-react';

export default function FamilyPage() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00ea47]/10 border border-[#00ea47]/20 rounded-full text-xs font-black uppercase text-[#00ea47] tracking-wider">
          <Award size={12} /> Our Supporters
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">Family & Credits</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The incredible team that made Jesse Rock Math possible. Thank you to everyone for your constant love, technical assistance, and infinite motivation!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <FamilyCredits />
      </div>
    </div>
  );
}
