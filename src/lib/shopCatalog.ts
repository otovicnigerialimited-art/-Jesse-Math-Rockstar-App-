export interface ShopItem {
  id: string;
  item_name: string;
  category: 'hair' | 'body' | 'instrument';
  coin_cost: number;
  description: string;
  icon_emoji: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  accent_color: string;
}

export const ADMIN_SEED_ITEMS: ShopItem[] = [
  // Hairs
  {
    id: 'hair_default',
    item_name: 'Classic Pixie Cut',
    category: 'hair',
    coin_cost: 0,
    description: 'The humble beginning of a legend. Clean and simple.',
    icon_emoji: '💇',
    rarity: 'Common',
    accent_color: 'from-slate-400 to-slate-500'
  },
  {
    id: 'hair_neon_spikes',
    item_name: 'Neon Spiky Blue',
    category: 'hair',
    coin_cost: 60,
    description: 'Electric blue mohawk spikes that glow in the dark!',
    icon_emoji: '⚡',
    rarity: 'Rare',
    accent_color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'hair_pink_mohawk',
    item_name: 'Pink Glam Mohawk',
    category: 'hair',
    coin_cost: 150,
    description: 'Ultra-bright magenta mohawk, styled with maximum hold.',
    icon_emoji: '🔥',
    rarity: 'Epic',
    accent_color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'hair_purple_afro',
    item_name: 'Retro Purple Afro',
    category: 'hair',
    coin_cost: 100,
    description: 'Retro 80s glam rock purple puff. Absolute groove monster.',
    icon_emoji: '👾',
    rarity: 'Rare',
    accent_color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'hair_golden_crown',
    item_name: 'Star King Crown',
    category: 'hair',
    coin_cost: 300,
    description: 'Dazzling solid gold star crown. Reserved for elite top-scorers!',
    icon_emoji: '👑',
    rarity: 'Legendary',
    accent_color: 'from-amber-400 via-orange-400 to-yellow-500'
  },
  {
    id: 'hair_flame_helmet',
    item_name: 'Supernova Fire Crown',
    category: 'hair',
    coin_cost: 450,
    description: 'Actual roaring math flames. Pure power radiating from your brain!',
    icon_emoji: '☀️',
    rarity: 'Legendary',
    accent_color: 'from-red-500 via-orange-500 to-yellow-500'
  },

  // Outfits
  {
    id: 'body_default',
    item_name: 'Jesse Starter Tee',
    category: 'body',
    coin_cost: 0,
    description: 'Comfortable cotton t-shirt with a sub-bass print.',
    icon_emoji: '👕',
    rarity: 'Common',
    accent_color: 'from-slate-400 to-slate-500'
  },
  {
    id: 'body_leather_jacket',
    item_name: 'Studded Biker Leather',
    category: 'body',
    coin_cost: 90,
    description: 'Classic heavy black leather jacket with silver studs and pins.',
    icon_emoji: '🧥',
    rarity: 'Rare',
    accent_color: 'from-slate-800 to-slate-950'
  },
  {
    id: 'body_neon_suit',
    item_name: 'Vaporwave Jumpsuit',
    category: 'body',
    coin_cost: 160,
    description: 'Luminous teal and purple grid jumpsuit. Smells like neon.',
    icon_emoji: '🔮',
    rarity: 'Epic',
    accent_color: 'from-teal-400 to-fuchsia-500'
  },
  {
    id: 'body_gold_armor',
    item_name: 'Superstar Gold Tux',
    category: 'body',
    coin_cost: 280,
    description: 'Gleaming 24k gold jacket with sharp diamond lapels.',
    icon_emoji: '👑',
    rarity: 'Legendary',
    accent_color: 'from-amber-400 to-yellow-600'
  },
  {
    id: 'body_tiger_vest',
    item_name: 'Zebra Glam Vest',
    category: 'body',
    coin_cost: 180,
    description: 'Wild tiger and zebra patterned vest with soft pink velvet lining.',
    icon_emoji: '🐅',
    rarity: 'Epic',
    accent_color: 'from-orange-400 to-yellow-500'
  },
  {
    id: 'body_space_suit',
    item_name: 'Nebula Space Armor',
    category: 'body',
    coin_cost: 350,
    description: 'Astronaut heavy gear with a built-in sub-woofer and starlight chest piece.',
    icon_emoji: '🚀',
    rarity: 'Legendary',
    accent_color: 'from-blue-600 via-indigo-600 to-violet-700'
  },

  // Instruments
  {
    id: 'instrument_default',
    item_name: 'Campfire Acoustic',
    category: 'instrument',
    coin_cost: 0,
    description: 'Unplugged and basic. Great for fireside chords.',
    icon_emoji: '🪵',
    rarity: 'Common',
    accent_color: 'from-amber-700 to-yellow-850'
  },
  {
    id: 'instrument_strat_red',
    item_name: 'Red Fire Stratocaster',
    category: 'instrument',
    coin_cost: 80,
    description: 'High-gain red electric guitar with custom pickguard.',
    icon_emoji: '🎸',
    rarity: 'Rare',
    accent_color: 'from-red-500 to-rose-700'
  },
  {
    id: 'instrument_flying_v',
    item_name: 'Flying-V Wildfire',
    category: 'instrument',
    coin_cost: 220,
    description: 'Sharp metal Flying-V in hot pink. Plucks thunder bolts!',
    icon_emoji: '👾',
    rarity: 'Epic',
    accent_color: 'from-pink-500 to-purple-600'
  },
  {
    id: 'instrument_gold_axe',
    item_name: 'Solid Gold Dragon Axe',
    category: 'instrument',
    coin_cost: 400,
    description: 'Double-neck legendary guitar made of dragon bone and solid gold.',
    icon_emoji: '🏆',
    rarity: 'Legendary',
    accent_color: 'from-yellow-400 via-amber-500 to-orange-500'
  },
  {
    id: 'instrument_neon_keytar',
    item_name: 'Synthwave Keytar',
    category: 'instrument',
    coin_cost: 180,
    description: 'Retro synth wizard keytar with neon keys and laser strap.',
    icon_emoji: '🎹',
    rarity: 'Epic',
    accent_color: 'from-cyan-400 to-pink-500'
  },
  {
    id: 'instrument_laser_harp',
    item_name: 'Cosmic Laser Harp',
    category: 'instrument',
    coin_cost: 320,
    description: 'Beams of direct pure stardust. Play math formulas like music!',
    icon_emoji: '🌌',
    rarity: 'Legendary',
    accent_color: 'from-indigo-400 via-cyan-400 to-teal-400'
  }
];
