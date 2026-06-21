import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AvatarPreviewProps {
  equippedItems?: {
    hair?: string;
    body?: string;
    instrument?: string;
  };
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStage?: boolean;
}

export default function AvatarPreview({
  equippedItems = { hair: 'hair_default', body: 'body_default', instrument: 'instrument_default' },
  animate = true,
  size = 'md',
  showStage = true
}: AvatarPreviewProps) {
  
  // Custom size scaling
  const dimensions = {
    sm: 'w-20 h-20 text-[8px]',
    md: 'w-36 h-36 text-xs',
    lg: 'w-56 h-56 text-sm',
    xl: 'w-full aspect-square text-base max-w-[320px]'
  }[size];

  const hairId = equippedItems.hair || 'hair_default';
  const bodyId = equippedItems.body || 'body_default';
  const instrumentId = equippedItems.instrument || 'instrument_default';

  // Animation variants for floating/swaying
  const floatVariant = animate ? {
    animate: {
      y: [0, -6, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  const neckSwayVariant = animate ? {
    animate: {
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  return (
    <div className={`relative rounded-3xl ${dimensions} overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center select-none shadow-xl group`}>
      
      {/* Background Stage Lights */}
      {showStage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#110c22] via-[#0b0818] to-black">
          {/* Spotlight beams merging in center */}
          <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent transform rotate-45 origin-top-left animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-0 right-0 w-full h-[150%] bg-gradient-to-tl from-transparent via-purple-500/10 to-transparent transform -rotate-45 origin-top-right animate-pulse" style={{ animationDuration: '6s' }} />
          
          {/* Neon Ring Grid */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-indigo-500/10 rounded-full border border-indigo-500/30 blur-[2px] flex items-center justify-center">
            <div className="w-[80%] h-8 bg-cyan-500/10 rounded-full border border-cyan-500/20 blur-[1px]" />
          </div>

          {/* Sparkles / Particles fly */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-8 left-6 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2.5s' }} />
            <div className="absolute top-1/2 right-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.8s' }} />
          </div>
        </div>
      )}

      {/* SVG Canvas overlay */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 p-1 filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
        variants={floatVariant}
        animate="animate"
      >
        <defs>
          {/* Neon Glow Filters */}
          <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-pink" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="gold-shimmer" x="-10%" y="-10%" width="120%" height="120%">
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.3" />
            </feComponentTransfer>
          </filter>

          {/* Linear Gradients */}
          <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd2b3" />
            <stop offset="100%" stopColor="#f3b890" />
          </linearGradient>

          <linearGradient id="jacketColor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252b36" />
            <stop offset="100%" stopColor="#0a0c10" />
          </linearGradient>

          <linearGradient id="neonSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="50%" stopColor="#8000ff" />
            <stop offset="100%" stopColor="#ff007f" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe600" />
            <stop offset="50%" stopColor="#ff9900" />
            <stop offset="100%" stopColor="#cc6600" />
          </linearGradient>

          <linearGradient id="zebraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="25%" stopColor="#f0f0f0" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="75%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>

          <linearGradient id="guitarRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a2a" />
            <stop offset="100%" stopColor="#7a0000" />
          </linearGradient>

          <linearGradient id="guitarFlying" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff007f" />
            <stop offset="100%" stopColor="#5500aa" />
          </linearGradient>

          <linearGradient id="spaceArmor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#ccd9e8" />
            <stop offset="100%" stopColor="#778ba5" />
          </linearGradient>
        </defs>

        <g>
          {/* 1. Base Head & Neck Structure */}
          <g>
            {/* Neck */}
            <rect x="92" y="100" width="16" height="20" fill="url(#bodySkin)" rx="4" />
            {/* Chest backing */}
            <path d="M 80 115 L 120 115 L 125 130 L 75 130 Z" fill="url(#bodySkin)" />
            {/* Main Face circle */}
            <circle cx="100" cy="72" r="30" fill="url(#bodySkin)" stroke="#da9f77" strokeWidth="1.5" />
          </g>

          {/* 2. BODY / OUTFIT PLAYER LAYER */}
          <g>
            {bodyId === 'body_default' && (
              // Simple default cotton tee shirt
              <g>
                {/* Shoulders */}
                <path d="M 60 128 C 60 128, 70 116, 100 116 C 130 116, 140 128, 140 128 L 145 180 L 55 180 Z" fill="#6366f1" />
                {/* Collar */}
                <path d="M 85 116 C 85 116, 100 128, 115 116 Z" fill="url(#bodySkin)" stroke="#da9f77" strokeWidth="1" />
                {/* Print logo: Rockstar Star */}
                <polygon points="100,132 103,139 111,139 105,144 107,151 100,147 93,151 95,144 89,139 97,139" fill="#fcd34d" />
              </g>
            )}

            {bodyId === 'body_leather_jacket' && (
              // Biker high-detail leather jacket
              <g>
                {/* Shoulders / Vest */}
                <path d="M 58 128 C 58 128, 68 114, 100 114 C 132 114, 142 128, 142 128 L 148 180 L 52 180 Z" fill="url(#jacketColor)" />
                {/* White inner shirt */}
                <path d="M 85 114 C 85 115, 100 135, 115 114 Z" fill="#ffffff" />
                <path d="M 90 114 C 90 114, 100 126, 110 114 Z" fill="url(#bodySkin)" />
                {/* Collar flaps */}
                <path d="M 75 116 L 90 136 L 72 138 Z" fill="#1e242f" stroke="#475569" strokeWidth="1" />
                <path d="M 125 116 L 110 136 L 128 138 Z" fill="#1e242f" stroke="#475569" strokeWidth="1" />
                {/* Metal zippers and pins */}
                <line x1="100" y1="135" x2="100" y2="180" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Little metal studs on collar */}
                <circle cx="76" cy="120" r="1.5" fill="#e2e8f0" />
                <circle cx="124" cy="120" r="1.5" fill="#e2e8f0" />
                <circle cx="86" cy="132" r="1.2" fill="#e2e8f0" />
                <circle cx="114" cy="132" r="1.2" fill="#e2e8f0" />
              </g>
            )}

            {bodyId === 'body_neon_suit' && (
              // Vaporwave grid futuristic suit
              <g>
                <path d="M 58 128 C 58 128, 68 114, 100 114 C 132 114, 142 128, 142 128 L 148 180 L 52 180 Z" fill="#110d24" stroke="#ff00aa" strokeWidth="2" filter="url(#neon-glow-pink)" />
                {/* Glowing neon gridlines */}
                <line x1="75" y1="120" x2="75" y2="180" stroke="#00f5ff" strokeWidth="1.2" />
                <line x1="100" y1="114" x2="100" y2="180" stroke="#8000ff" strokeWidth="1.2" />
                <line x1="125" y1="120" x2="125" y2="180" stroke="#00f5ff" strokeWidth="1.2" />
                <line x1="53" y1="140" x2="147" y2="140" stroke="#ff00aa" strokeWidth="1" />
                <line x1="53" y1="160" x2="147" y2="160" stroke="#ff00aa" strokeWidth="1" />
                {/* Glowing neon delta insignia */}
                <polygon points="100,122 108,134 92,134" fill="#00f5ff" filter="url(#neon-glow-cyan)" />
              </g>
            )}

            {bodyId === 'body_gold_armor' && (
              // Superstar gold suit with shoulder pads
              <g filter="url(#gold-shimmer)">
                <path d="M 58 128 C 58 128, 68 112, 100 112 C 132 112, 142 128, 142 128 L 148 180 L 52 180 Z" fill="url(#goldGrad)" stroke="#ffd700" strokeWidth="1" />
                {/* Purple premium tie */}
                <path d="M 97 122 L 103 122 L 105 142 L 100 148 L 95 142 Z" fill="#8b5cf6" />
                {/* Diamond gold shoulder pads */}
                <path d="M 52 128 L 65 110 L 80 122 Z" fill="#ffea55" stroke="#f59e0b" strokeWidth="1" />
                <path d="M 148 128 L 135 110 L 120 122 Z" fill="#ffea55" stroke="#f59e0b" strokeWidth="1" />
                {/* Bling medal necklace */}
                <circle cx="100" cy="116" r="3" fill="#ec4899" />
                <line x1="90" y1="112" x2="100" y2="116" stroke="#fbbf24" strokeWidth="1.5" />
                <line x1="110" y1="112" x2="100" y2="116" stroke="#fbbf24" strokeWidth="1.5" />
              </g>
            )}

            {bodyId === 'body_tiger_vest' && (
              // Tiger glam vest
              <g>
                {/* Base Vest shape */}
                <path d="M 58 128 C 58 128, 68 114, 100 114 C 132 114, 142 128, 142 128 L 148 180 L 52 180 Z" fill="url(#zebraGrad)" />
                {/* Hot pink velvet collar */}
                <path d="M 85 114 C 85 114, 100 132, 115 114 Z" fill="#ec4899" stroke="#f43f5e" strokeWidth="1" />
                {/* Gold trimming */}
                <path d="M 58 128 L 52 180" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M 142 128 L 148 180" stroke="#f59e0b" strokeWidth="2.5" />
              </g>
            )}

            {bodyId === 'body_space_suit' && (
              // Cyber space explorer suit
              <g>
                <path d="M 54 130 C 54 130, 66 110, 100 110 C 134 110, 146 130, 146 130 L 152 182 L 48 182 Z" fill="url(#spaceArmor)" stroke="#94a3b8" strokeWidth="2" />
                {/* Big chest projector ring */}
                <circle cx="100" cy="142" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="100" cy="142" r="9" fill="#0284c7" filter="url(#neon-glow-cyan)" />
                {/* Cyber power indicators */}
                <rect x="74" y="155" width="10" height="4" fill="#34d399" rx="1" />
                <rect x="116" y="155" width="10" height="4" fill="#f43f5e" rx="1" />
                {/* Bold horizontal armor ribbing */}
                <line x1="52" y1="168" x2="148" y2="168" stroke="#cbd5e1" strokeWidth="3" />
                <line x1="54" y1="174" x2="146" y2="174" stroke="#475569" strokeWidth="1.5" />
              </g>
            )}
          </g>

          {/* 3. FACE DETAILS (Eyes, mouth, star specs) */}
          <g>
            {/* Cute rosy blush cheeks */}
            <circle cx="82" cy="80" r="4" fill="#f43f5f" opacity="0.35" />
            <circle cx="118" cy="80" r="4" fill="#f43f5f" opacity="0.35" />

            {/* Mouth: Wide Rockstar Smile */}
            <path d="M 88 84 Q 100 98 112 84 C 112 84, 100 90, 88 84 Z" fill="#ffe2e2" stroke="#a02930" strokeWidth="1.5" />
            {/* Smiling tongue detailing */}
            <path d="M 94 87 Q 100 93 106 87 Q 100 95 94 87 Z" fill="#f43f5e" />

            {/* COOL DESIGNER STAR SUNGLASSES (Every rockstar needs specs!) */}
            {/* Left Frame Star */}
            <polygon points="82,65 85,71 91,71 86,75 88,81 82,78 76,81 78,75 73,71 79,71" fill="#ec4899" filter="url(#neon-glow-pink)" />
            <polygon points="82,67 84,71 89,71 85,74 87,78 82,76 77,78 79,74 75,71 80,71" fill="#ffffff" />
            
            {/* Right Frame Star */}
            <polygon points="118,65 121,71 127,71 122,75 124,81 118,78 112,81 114,75 109,71 115,71" fill="#ec4899" filter="url(#neon-glow-pink)" />
            <polygon points="118,67 120,71 125,71 121,74 123,78 118,76 113,78 115,74 111,71 116,71" fill="#ffffff" />

            {/* Glasses Bridge line */}
            <line x1="90" y1="71" x2="110" y2="71" stroke="#ff3b99" strokeWidth="2.5" />
          </g>

          {/* 4. HAIR/HEAD ACCESSORY LAYER */}
          <g>
            {hairId === 'hair_default' && (
              // Simple classic swoop hair
              <g fill="#7c2d12" stroke="#451a03" strokeWidth="1.5">
                {/* Left side locks */}
                <path d="M 69 70 Q 72 42, 100 42 Q 128 42, 131 70 Q 115 56, 100 58 Q 85 56, 69 70 Z" />
                {/* front side bangs */}
                <path d="M 72 65 C 72 65, 85 52, 95 58 Z" />
                <path d="M 128 65 C 128 65, 115 52, 105 58 Z" />
              </g>
            )}

            {hairId === 'hair_neon_spikes' && (
              // Electric spiky blue rockstar hairs
              <g fill="#00f0ff" stroke="#0369a1" strokeWidth="1.5" filter="url(#neon-glow-cyan)">
                <path d="M 68 62 L 50 48 L 74 48 L 65 24 L 88 38 L 100 12 L 112 38 L 135 24 L 126 48 L 150 48 L 132 62 C 140 35, 60 35, 68 62 Z" />
              </g>
            )}

            {hairId === 'hair_pink_mohawk' && (
              // Flamboyant neon pink glam mohawk
              <g fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" filter="url(#neon-glow-pink)">
                <path d="M 90 44 L 85 8 Q 100 -4 102 -4 Q 104 -4 115 8 L 110 44 C 114 36, 86 36, 90 44 Z" />
                <path d="M 88 28 L 68 12 L 89 16 Z" />
                <path d="M 112 28 L 132 12 L 111 16 Z" />
                {/* Glow sparkles */}
                <circle cx="100" cy="5" r="2.5" fill="#ffffff" />
              </g>
            )}

            {hairId === 'hair_purple_afro' && (
              // Fun retro purple cloud afro
              <g fill="#c084fc" stroke="#6b21a8" strokeWidth="2">
                <circle cx="100" cy="38" r="24" />
                <circle cx="80" cy="50" r="18" />
                <circle cx="120" cy="50" r="18" />
                <circle cx="82" cy="34" r="16" />
                <circle cx="118" cy="34" r="16" />
                <circle cx="100" cy="24" r="20" />
                {/* Cute custom mini star embedded */}
                <polygon points="100,24 103,29 109,29 104,33 106,38 100,35 94,38 96,33 91,29 97,29" fill="#fcd34d" />
              </g>
            )}

            {hairId === 'hair_golden_crown' && (
              // Shining star conquerors royal crown
              <g filter="url(#gold-shimmer)">
                <path d="M 70 46 L 62 18 L 82 32 L 100 10 L 118 32 L 138 18 L 130 46 Z" fill="url(#goldGrad)" stroke="#fbbf24" strokeWidth="1.5" />
                {/* Floating star particles */}
                <circle cx="100" cy="3" r="2" fill="#ffd700" />
                <circle cx="62" cy="12" r="1.5" fill="#ffd700" />
                <circle cx="138" cy="12" r="1.5" fill="#ffd700" />
                {/* Crown base jewels */}
                <circle cx="100" cy="36" r="3" fill="#f43f5e" />
                <circle cx="85" cy="38" r="2" fill="#38bdf8" />
                <circle cx="115" cy="38" r="2" fill="#34d399" />
              </g>
            )}

            {hairId === 'hair_flame_helmet' && (
              // Exploding starlight fire crown hair
              <g fill="url(#goldGrad)" filter="url(#neon-glow-pink)">
                <path d="M 68 55 Q 52 32, 60 20 Q 72 28, 80 12 Q 90 28, 100 4 Q 110 28, 120 12 Q 128 28, 140 20 Q 148 32, 132 55 C 132 55, 100 44, 68 55 Z" />
                <path d="M 78 45 Q 65 30, 80 24 Q 90 32, 100 15 Q 110 32, 120 24 Q 135 30, 122 45 Z" fill="#ff4c00" />
                <path d="M 88 40 Q 94 32, 100 24 Q 106 32, 112 40 Z" fill="#ffef55" />
              </g>
            )}
          </g>

          {/* 5. ACTIVE INSTRUMENT (Drawn overlay diagonal across neck & shoulders) */}
          <g>
            {instrumentId === 'instrument_default' && (
              // Classic unplugged wooden acoustic guitar
              <g>
                <g transform="rotate(-30, 100, 136)">
                  {/* Neck / Fretboard */}
                  <rect x="50" y="126" width="60" height="6" fill="#78350f" />
                  <rect x="34" y="121" width="16" height="12" fill="#92400e" rx="2" />
                  {/* Pegs */}
                  <circle cx="38" cy="119" r="1.5" fill="#d97706" />
                  <circle cx="44" cy="119" r="1.5" fill="#d97706" />
                  <circle cx="41" cy="135" r="1.5" fill="#d97706" />
                  <circle cx="47" cy="135" r="1.5" fill="#d97706" />

                  {/* Body shape (hourglass wood) */}
                  <path d="M 105 110 C 122 110, 145 118, 145 130 C 145 142, 128 145, 122 136 C 118 145, 104 142, 104 130 C 104 118, 101 110, 105 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                  {/* Hole */}
                  <circle cx="122" cy="126" r="6" fill="#451a03" />
                  {/* Bridge panel */}
                  <rect x="133" y="123" width="3" height="8" fill="#451a03" />
                </g>
              </g>
            )}

            {instrumentId === 'instrument_strat_red' && (
              // High gain classic rockstar neon red electric guitar
              <g>
                <g transform="rotate(-28, 100, 137)">
                  {/* Tuning fretboard */}
                  <rect x="42" y="125" width="70" height="5" fill="#fed7aa" />
                  <rect x="26" y="120" width="16" height="11" fill="#ea580c" rx="2" />
                  {/* Bright red body */}
                  <path d="M 100 110 L 140 102 C 146 112, 155 125, 152 134 C 148 144, 130 148, 122 137 Q 115 146, 105 130 Z" fill="url(#guitarRed)" stroke="#ef4444" strokeWidth="1" />
                  {/* Pickguard plate white */}
                  <path d="M 116 118 C 124 118, 136 122, 134 134 C 128 136, 122 130, 116 118 Z" fill="#ffffff" />
                  {/* Sound Pickup bars */}
                  <rect x="122" y="123" width="5" height="4" fill="#64748b" />
                  <rect x="128" y="124" width="2" height="6" fill="#1e293b" />
                </g>
              </g>
            )}

            {instrumentId === 'instrument_flying_v' && (
              // Sharp cyberpunk double-winged pink speed guitar
              <g>
                <g transform="rotate(-32, 100, 135)" filter="url(#neon-glow-pink)">
                  {/* Long dark fretboard */}
                  <rect x="32" y="126" width="80" height="4" fill="#1e1b4b" stroke="#00f5ff" strokeWidth="0.5" />
                  {/* Arrowhead headstock */}
                  <polygon points="20,121 32,126 32,131 20,135 26,128" fill="#ff007f" />

                  {/* Sharp double arrow body (Flying V) */}
                  <polygon points="104,110 156,92 142,128 152,158 112,138" fill="url(#guitarFlying)" stroke="#ff007f" strokeWidth="1" />
                  {/* Center neon pickup zone */}
                  <polygon points="112,122 132,118 128,131 114,129" fill="#00f5ff" />
                </g>
              </g>
            )}

            {instrumentId === 'instrument_gold_axe' && (
              // Legendary double-neck battle axe guitar for heroes
              <g filter="url(#gold-shimmer)">
                <g transform="rotate(-25, 100, 136)">
                  {/* Double necks */}
                  <rect x="40" y="121" width="65" height="4" fill="#fbbf24" />
                  <rect x="42" y="130" width="65" height="4" fill="#fbbf24" />
                  {/* Twin headstocks */}
                  <rect x="24" y="117" width="16" height="8" fill="#d97706" rx="2" />
                  <rect x="26" y="128" width="16" height="8" fill="#d97706" rx="2" />

                  {/* Axe-shaped golden double body */}
                  <path d="M 100 110 C 110 95, 135 90, 142 108 L 152 144 C 138 156, 110 152, 102 134 Z" fill="url(#goldGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Blades on side of axe body */}
                  <path d="M 124 100 Q 148 108, 136 124 Q 148 140, 126 142" fill="#fffaaa" opacity="0.9" />

                  {/* Red centerpiece ruby gems */}
                  <circle cx="114" cy="122" r="3" fill="#f43f5e" />
                  <circle cx="124" cy="128" r="3" fill="#f43f5e" />
                </g>
              </g>
            )}

            {instrumentId === 'instrument_neon_keytar' && (
              // Vintage 80s neon purple/cyan keytar synth
              <g>
                <g transform="rotate(-22, 100, 138)">
                  {/* Handle neck */}
                  <rect x="35" y="122" width="60" height="7" fill="#1e1e38" stroke="#ff00aa" strokeWidth="1" />
                  {/* Keytar body bar */}
                  <rect x="90" y="116" width="65" height="24" fill="#111827" stroke="#00f5ff" strokeWidth="2" filter="url(#neon-glow-cyan)" rx="4" />
                  {/* Bright glowing yellow keys */}
                  <rect x="100" y="121" width="45" height="11" fill="#fcd34d" />
                  {/* Black key lines overlay */}
                  <line x1="105" y1="121" x2="105" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="110" y1="121" x2="110" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="115" y1="121" x2="115" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="120" y1="121" x2="120" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="125" y1="121" x2="125" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="130" y1="121" x2="130" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="135" y1="121" x2="135" y2="128" stroke="#000000" strokeWidth="1" />
                  <line x1="140" y1="121" x2="140" y2="128" stroke="#000000" strokeWidth="1" />
                </g>
              </g>
            )}

            {instrumentId === 'instrument_laser_harp' && (
              // Celestial high-tech light-beam harp
              <g>
                <g transform="rotate(-30, 100, 135)">
                  {/* Outer laser support frames */}
                  <path d="M 64 132 C 64 120, 80 102, 106 98 L 134 110 L 124 148 Q 100 152, 64 132 Z" fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#neon-glow-pink)" />
                  {/* Glowing Laser emission lines */}
                  <line x1="80" y1="116" x2="80" y2="140" stroke="#00f5ff" strokeWidth="1.5" filter="url(#neon-glow-cyan)" />
                  <line x1="90" y1="110" x2="90" y2="144" stroke="#00f5ff" strokeWidth="1.5" filter="url(#neon-glow-cyan)" />
                  <line x1="100" y1="106" x2="100" y2="146" stroke="#00f5ff" strokeWidth="1.5" filter="url(#neon-glow-cyan)" />
                  <line x1="110" y1="104" x2="110" y2="144" stroke="#00f5ff" strokeWidth="1.5" filter="url(#neon-glow-cyan)" />
                  <line x1="120" y1="108" x2="120" y2="132" stroke="#00f5ff" strokeWidth="1.5" filter="url(#neon-glow-cyan)" />
                </g>
              </g>
            )}
          </g>
        </g>
      </motion.svg>

      {/* Hologram details / Border shimmer */}
      <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-cyan-950/80 to-transparent flex items-center justify-center gap-1.5 backdrop-blur-[0.5px] border-t border-cyan-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-400 select-none">3D HOLO PROJECTION</span>
      </div>
      
    </div>
  );
}
