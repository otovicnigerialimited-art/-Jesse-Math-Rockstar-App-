import React from 'react';

export default function FamilyCredits() {
  return (
    <div className="bg-slate-900/60 border-2 border-[#00ea47] rounded-3xl p-6 space-y-6 my-8">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black text-[#00ea47] flex items-center justify-center gap-2">
          🇳🇬 Olé To My Family! Official Credits 👑
        </h3>
        <p className="text-xs text-slate-300 italic">"Proudly supported by the greatest squad behind the scenes."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
        <div className="space-y-2">
          <h4 className="font-bold text-white flex items-center gap-2">⭐ Executive Management</h4>
          <ul className="space-y-1 ml-4 text-xs">
            <li>Aunty Mercy — Chief Advisor & Executive Director</li>
            <li>Aunty Joy — Head of Creative Motivation & Support</li>
            <li className="text-[#00ea47] font-semibold mt-2">Dad — Special thanks for his assistance and pushing me to never give up.</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-white flex items-center gap-2">🚀 Board of Directors</h4>
          <ul className="space-y-1 ml-4 text-xs">
            <li>Odion Otobo — Senior Global Consultant</li>
            <li>Blessed Otobo — Chief Vibe Officer</li>
            <li>Ehiosu Otobo — Strategy & Operations Specialist</li>
            <li>Rossi Otobo — Head of Future Innovations</li>
            <li>All the Otobo & Aigbokhan Families — Ultimate Global Support Squad</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-white flex items-center gap-2">🤫 Honorary Partners</h4>
          <ul className="space-y-1 ml-4 text-xs">
            <li>My Siblings — Moral Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
