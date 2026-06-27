import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db 
} from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { 
  ADMIN_SEED_ITEMS, 
  ShopItem 
} from '../lib/shopCatalog';
import { playBuySound } from '../lib/audioUtils';
import AvatarPreview from './AvatarPreview';
import { 
  Sparkles, 
  Coins, 
  Check, 
  Lock, 
  ChevronRight, 
  Gamepad2, 
  Music, 
  Grid, 
  ShoppingBag, 
  BadgeAlert, 
  Flame, 
  Shirt, 
  UserRound, 
  Volume2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface RockShopProps {
  userId: string;
  role?: 'student' | 'individual' | 'teacher' | 'admin';
  onNavigateToTab?: (tab: any) => void;
}

export default function RockShop({ userId, role = 'student', onNavigateToTab }: RockShopProps) {
  const [activeCategory, setActiveCategory] = useState<'hair' | 'body' | 'instrument'>('instrument');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  
  // Student or User live sync state
  const [userStreak, setUserStreak] = useState<number>(0);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<{ hair: string; body: string; instrument: string }>({
    hair: 'hair_default',
    body: 'body_default',
    instrument: 'instrument_default'
  });

  // UI animations and error feedback
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedItem, setCelebratedItem] = useState<ShopItem | null>(null);

  // Determine current Firestore collection
  const profileCollectionName = role === 'student' ? 'school_students' : 'users';

  // 1. Initial Seeding and Fetch of shop_items
  useEffect(() => {
    async function loadAndSeedShop() {
      try {
        setLoadingShop(true);
        const colRef = collection(db, 'shop_items');
        const snap = await getDocs(colRef);
        
        let loaded: ShopItem[] = [];
        
        if (snap.empty) {
          console.log("Shop items collection is empty. Seeding defaults...");
          const batch = writeBatch(db);
          ADMIN_SEED_ITEMS.forEach((item) => {
            const docRef = doc(colRef, item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
          loaded = [...ADMIN_SEED_ITEMS];
        } else {
          snap.forEach((d) => {
            loaded.push(d.data() as ShopItem);
          });
        }
        
        // Sort items so defaults / cheap comes first
        loaded.sort((a,b) => a.coin_cost - b.coin_cost);
        setShopItems(loaded);
      } catch (err) {
        console.error("Error loading/seeding shop_items:", err);
      } finally {
        setLoadingShop(false);
      }
    }
    loadAndSeedShop();
  }, []);

  // 2. Real-time Live synchronization of Student/User details
  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, profileCollectionName, userId);
    
    // Subscribe to live changes
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        // Handle Student structure vs User structure
        let streak = 0;
        let pItems: string[] = [];
        let eqItems = { hair: 'hair_default', body: 'body_default', instrument: 'instrument_default' };

        if (role === 'student') {
          // If the math_progress_data has streak - we use streak as balance
          streak = typeof data.streak !== 'undefined' ? data.streak : (data.math_progress_data?.streak || 0);
          pItems = data.purchased_items || [];
          eqItems = data.equipped_items || { hair: 'hair_default', body: 'body_default', instrument: 'instrument_default' };
        } else {
          streak = typeof data.streak !== 'undefined' ? data.streak : 0;
          pItems = data.purchased_items || [];
          eqItems = data.equipped_items || { hair: 'hair_default', body: 'body_default', instrument: 'instrument_default' };
        }

        setUserStreak(streak);
        setPurchasedItemIds(pItems);
        
        // Default fallbacks for equipped elements
        setEquippedItems({
          hair: eqItems.hair || 'hair_default',
          body: eqItems.body || 'body_default',
          instrument: eqItems.instrument || 'instrument_default'
        });
      } else {
        // If document doesn't exist, seed basic variables on Firestore to avoid crashes
        try {
          setDoc(docRef, {
            id: userId,
            coins: 100,
            purchased_items: ['hair_default', 'body_default', 'instrument_default'],
            equipped_items: { hair: 'hair_default', body: 'body_default', instrument: 'instrument_default' }
          }, { merge: true });
        } catch (e) {
          console.warn("Could not seed missing profile document:", e);
        }
      }
    }, (err) => {
      console.error("onSnapshot error in RockShop:", err);
    });

    return () => unsubscribe();
  }, [userId, role, profileCollectionName]);

  // Audio Generator helper for Gamified rewards
  const playRockSound = (type: 'win' | 'equip' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) return;

      if (type === 'win') {
        // High energy rock power-chord synth effect!
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc2.type = 'square';
        
        // F3 & A3 chords for powerful major interval
        osc.frequency.setValueAtTime(174.61, audioCtx.currentTime); // F3
        osc2.frequency.setValueAtTime(220.00, audioCtx.currentTime); // A3
        
        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Quick volume envelope
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.8);
        
        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 1.8);
        osc2.stop(audioCtx.currentTime + 1.8);
      } else if (type === 'equip') {
        // Nice retro synth pop sound
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4
        osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.15); // E5
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.22);
      } else if (type === 'error') {
        // Sad spring / alert drop sound
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.25);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Web Audio API disabled or blocked:", e);
    }
  };

  // Transaction Transaction safety & purchase validator
  const handleBuyItem = async (item: ShopItem) => {
    setErrorMessage(null);
    const docRef = doc(db, profileCollectionName, userId);

    try {
      // 1. Transaction verification: Read live coin state first from DB
      const freshSnap = await getDoc(docRef);
      if (!freshSnap.exists()) {
        throw new Error("User record expired or not found!");
      }
      
      const freshData = freshSnap.data();
      const freshStreak = typeof freshData.streak !== 'undefined' ? freshData.streak : (freshData.math_progress_data?.streak || 0);
      const freshPurchased = freshData.purchased_items || [];

      // Double ownership checker
      if (freshPurchased.includes(item.id)) {
        setErrorMessage(`You already unlocked ${item.item_name}! Try equipping it.`);
        return;
      }

      // Check balance (streak) availability
      if (freshStreak < item.coin_cost) {
        setShakingCardId(item.id);
        playRockSound('error');
        setErrorMessage("Rock louder! Earn more streak in the Play Arena to unlock this!");
        
        // Remove shake after half a second
        setTimeout(() => setShakingCardId(null), 600);
        return;
      }

      // 2. Perform Atomic deduction & unlock
      const updatedStreak = freshStreak - item.coin_cost;
      const updatedPurchased = [...freshPurchased, item.id];

      // Build data block
      const updateData: any = {
        streak: updatedStreak, // Streak is balance now
        purchased_items: updatedPurchased
      };

      // Also support storing in math_progress_data nested path if standard student setup
      if (role === 'student' && freshData.math_progress_data) {
        updateData.math_progress_data = {
          ...freshData.math_progress_data,
          streak: updatedStreak // Streak is balance now
        };
      }

      await updateDoc(docRef, updateData);

      // Play successful purchase confetti explosion and sound
      setCelebratedItem(item);
      setShowConfetti(true);
      playRockSound('win');
      playBuySound();

    } catch (err: any) {
      console.error("Atomic transaction failed:", err);
      setErrorMessage("Shop database was busy. Please try your purchase again!");
    }
  };

  // Live item equipment handler
  const handleEquipItem = async (item: ShopItem) => {
    setErrorMessage(null);
    if (!purchasedItemIds.includes(item.id) && item.coin_cost > 0) {
      setErrorMessage(`Unlock ${item.item_name} first before putting it on!`);
      return;
    }

    const docRef = doc(db, profileCollectionName, userId);
    
    // Update matching category slot in equipped_items mapping
    const newEquipped = {
      ...equippedItems,
      [item.category]: item.id
    };

    try {
      await updateDoc(docRef, {
        equipped_items: newEquipped
      });
      playRockSound('equip');
    } catch (err) {
      console.error("Failed to update equipped setup on Firestore:", err);
      setErrorMessage("Failed to sync your rockgear. Please refresh!");
    }
  };

  const handleUnequipItem = async (item: ShopItem) => {
    setErrorMessage(null);
    const docRef = doc(db, profileCollectionName, userId);

    // Swap back to defaults
    const defaultIds = {
      hair: 'hair_default',
      body: 'body_default',
      instrument: 'instrument_default'
    };

    const newEquipped = {
      ...equippedItems,
      [item.category]: defaultIds[item.category]
    };

    try {
      await updateDoc(docRef, {
        equipped_items: newEquipped
      });
      playRockSound('equip');
    } catch (err) {
      console.error("Failed to unequip item:", err);
    }
  };

  // Filter items by selected sub-category
  const filteredItems = shopItems.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-8 relative">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-primary to-fuchsia-600 rounded-2xl flex items-center justify-center p-0.5 shadow-lg shadow-brand-primary/20 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              🎸
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Rock Shop <span className="text-xs bg-brand-accent/20 text-brand-accent px-2.5 py-1 rounded-full border border-brand-accent/20">LIVE ARENA</span>
            </h1>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mt-0.5">
              Spend math coins earned from battles to power up your look!
            </p>
          </div>
        </div>

        {/* Live Balance box */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shrink-0 shadow-lg relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform duration-300">
            <Flame size={22} className="animate-pulse text-amber-400" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">Your Math Balance</p>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1 flex items-center gap-1.5">
              {userStreak.toLocaleString()} <span className="text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight">Streak</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid layout splits avatar vs shop items */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stage projection of current avatar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center text-center space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest">
                Arena Profile
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Rockstar Stage</h3>
            </div>

            {/* Avatar display frame */}
            <AvatarPreview 
              equippedItems={equippedItems} 
              size="xl" 
              animate={true} 
              showStage={true}
            />

            {/* Equipment lists readout */}
            <div className="w-full bg-slate-950/80 border border-white/5 rounded-2xl p-4 text-left font-mono text-[10px] space-y-3.5">
              <p className="text-[10px] text-slate-450 uppercase font-black border-b border-white/5 pb-2 tracking-widest flex items-center gap-1.5">
                <Music size={11} className="text-brand-primary" /> Active Live Equipment
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 font-bold uppercase">💇 Hairstyles</span>
                  <span className="text-white font-extrabold truncate max-w-[140px]">
                    {shopItems.find(i => i.id === equippedItems.hair)?.item_name || 'Classic Pixie'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 font-bold uppercase">👕 Outfits</span>
                  <span className="text-white font-extrabold truncate max-w-[140px]">
                    {shopItems.find(i => i.id === equippedItems.body)?.item_name || 'Jesse Starter Tee'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 font-bold uppercase">🎸 Instruments</span>
                  <span className="text-white font-extrabold truncate max-w-[140px]">
                    {shopItems.find(i => i.id === equippedItems.instrument)?.item_name || 'Campfire Acoustic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons to go play */}
            {onNavigateToTab && (
              <button 
                onClick={() => onNavigateToTab('quiz')}
                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-indigo-650 hover:opacity-90 font-black uppercase text-xs tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/10"
              >
                <Gamepad2 size={13} /> Earn More Streak In Arena <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Category Shop Grid list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Category Tab selections */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveCategory('instrument')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'instrument'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-250'
              }`}
            >
              <Music size={14} /> Guitars & Harps
            </button>
            <button
              onClick={() => setActiveCategory('hair')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'hair'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-250'
              }`}
            >
              <UserRound size={14} /> Hairstyles
            </button>
            <button
              onClick={() => setActiveCategory('body')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'body'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-250'
              }`}
            >
              <Shirt size={14} /> Outfits
            </button>
          </div>

          {/* Quick Real-Time Error alert message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/25 text-red-300 text-xs font-bold font-sans flex items-center gap-2.5"
              >
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shop loading spinner */}
          {loadingShop ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 rounded-3xl border border-white/5">
              <span className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-4">FETCHING DECOR SHOP COLLATERAL...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filteredItems.map((item) => {
                const isOwned = item.coin_cost === 0 || purchasedItemIds.includes(item.id);
                const isEquipped = (item.category === 'hair' && equippedItems.hair === item.id) ||
                                  (item.category === 'body' && equippedItems.body === item.id) ||
                                  (item.category === 'instrument' && equippedItems.instrument === item.id);
                
                const rarityColors = {
                  Common: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
                  Rare: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                  Epic: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                  Legendary: 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse'
                }[item.rarity];

                const isShaking = shakingCardId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    animate={isShaking ? {
                      x: [-6, 6, -6, 6, -3, 3, 0],
                      transition: { duration: 0.5 }
                    } : {}}
                    className={`p-5 rounded-3xl bg-slate-900/20 hover:bg-slate-900/40 border transition-all flex flex-col justify-between group overflow-hidden relative ${
                      isEquipped 
                        ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/5' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Item Rarity Tag & Accent shine */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${rarityColors}`}>
                        {item.rarity}
                      </span>
                      {isOwned && (
                        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/10">
                          <Check size={8} strokeWidth={4} /> Unlocked
                        </span>
                      )}
                    </div>

                    {/* Emoji representation & basic details info */}
                    <div className="flex items-start gap-4 my-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent_color} flex items-center justify-center text-3xl shrink-0 shadow-lg relative group-hover:scale-105 transition-transform duration-300`}>
                        {item.icon_emoji}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white group-hover:text-brand-primary transition-colors">
                          {item.item_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Panel section of the item card */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                      <div>
                        {/* Cost Display */}
                        {item.coin_cost === 0 ? (
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Default Gear</span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-slate-550 uppercase font-black tracking-widest block">Coin Fee</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-500">
                              <Coins size={12} /> {item.coin_cost}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Decisive Button trigger logic based on item status */}
                      <div>
                        {isEquipped ? (
                          <button
                            onClick={() => handleUnequipItem(item)}
                            className="px-4.5 py-2 bg-brand-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand-primary/85 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10"
                          >
                            <CheckCircle2 size={11} strokeWidth={3} /> Equipped
                          </button>
                        ) : isOwned ? (
                          <button
                            onClick={() => handleEquipItem(item)}
                            className="px-4.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-white/5 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            👕 Swap Equip
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyItem(item)}
                            className="px-4.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1"
                          >
                            🛒 BUY
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Rockstar Confetti Spark Splash celebration Overlay */}
      <AnimatePresence>
        {showConfetti && celebratedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark background backing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setShowConfetti(false)}
            />

            {/* Content card popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-[#1b153b] via-[#0e0a24] to-black border-2 border-amber-500/30 p-8 text-center space-y-6 shadow-2xl overflow-hidden"
            >
              {/* Star sparkles background animations */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 text-xl animate-pulse">🎸</div>
                <div className="absolute bottom-10 right-10 text-xl animate-pulse" style={{ animationDelay: '0.8s' }}>👑</div>
                <div className="absolute top-1/2 right-8 text-lg animate-pulse" style={{ animationDelay: '0.4s' }}>✨</div>
                <div className="absolute bottom-1/2 left-8 text-lg animate-pulse" style={{ animationDelay: '1.2s' }}>⚡</div>
              </div>

              {/* Giant pulsing unlocked item emoji */}
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-28 h-28 mx-auto rounded-[2rem] bg-gradient-to-br ${celebratedItem.accent_color} flex items-center justify-center text-6xl shadow-xl shadow-amber-500/10 relative z-10`}
              >
                {celebratedItem.icon_emoji}
              </motion.div>

              <div className="space-y-2 relative z-10">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full uppercase font-black tracking-widest">
                  ACCESSORY UNLOCKED!
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight pt-1">
                  {celebratedItem.item_name}
                </h3>
                <p className="text-xs text-slate-400 font-semibold italic max-w-xs mx-auto leading-relaxed">
                  "{celebratedItem.description}"
                </p>
              </div>

              {/* Success equip checkbox trigger option */}
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => {
                    handleEquipItem(celebratedItem);
                    setShowConfetti(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/15"
                >
                  <CheckCircle2 size={13} strokeWidth={3} /> EQUIP IMMEDIATELY
                </button>
                <button
                  onClick={() => setShowConfetti(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-450 hover:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Browse more items
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
