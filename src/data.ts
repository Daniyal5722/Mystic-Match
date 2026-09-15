import { Level, GemType, DailyLoginReward, Mission } from './types';

const GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'prism'];

const LEVEL_NAMES = [
  'Awakening', 'Broken Bridge', 'Sunken Shrine', 'Mossy Gorge', 'Whispering Winds',
  'Obsidian Caverns', 'Glacial Spires', 'Storm Ridge', 'Celestial Spire', 'Aether Dragon',
  'Enchanted Glade', 'Echoing Abyss', 'Ruby Summit', 'Misty Swamps', 'Shattered Peaks',
  'Lost Ruins', 'Ancient Grove', 'Twilight Dunes', 'Sapphire Oasis', 'Leviathan Depths',
  'Solstice Plains', 'Eclipse Valley', 'Viper Canyon', 'Phantom Keep', 'Crystalline Caves',
  'Chrono Keep', 'Nova Nebula', 'Cosmic Chasm', 'Sovereign Throne', 'Beholder Lair',
  'Ashen Waste', 'Brimstone Crater', 'Phoenix Rise', 'Wild Canopy', 'Frost Giants',
  'Hydra Bay', 'Gorgon Reef', 'Cyclops Citadel', 'Minotaur Maze', 'Chimera Crag',
  'Valhalla Gates', 'Asgard Bridge', 'Ragnarok Peaks', 'El Dorado Pool', 'Avalon Woods',
  'Camelot Castle', 'Shangri-La Pass', 'Atlantis Abyss', 'Pandora Box', 'Genesis Peak'
];

export const INITIAL_LEVELS: Level[] = [];

for (let i = 1; i <= 50; i++) {
  const isBoss = i % 10 === 0;
  const name = LEVEL_NAMES[i - 1] || `Mystic Isle ${i}`;
  const recommendedPower = 800 + (i - 1) * 150 + (isBoss ? 1000 : 0);
  const gemType = GEM_TYPES[(i - 1) % GEM_TYPES.length];
  
  // Made levels easier to play and win
  let objectiveTarget = 10 + Math.floor((i - 1) * 0.8);
  if (isBoss) objectiveTarget = Math.floor(objectiveTarget * 1.1);

  let loot = `Standard Crystal x${3 + (i % 3)}`;
  if (isBoss) {
    loot = `Boss Core Shard, ${(i / 10) * 1000} Gems`;
  } else if (i % 5 === 0) {
    loot = `Rare Elixir, ${i * 50} Gold`;
  }

  INITIAL_LEVELS.push({
    id: i,
    name,
    stars: 0,
    isLocked: i !== 1,
    isBoss,
    recommendedPower,
    loot,
    objectiveTarget,
    objectiveType: gemType
  });
}

export const DAILY_LOGIN_REWARDS: DailyLoginReward[] = [
  { day: 1, rewardDescription: '300 Gold Coins', coins: 300 },
  { day: 2, rewardDescription: '1 Hint Booster + 100 Coins', coins: 100, boosters: { hint: 1 } },
  { day: 3, rewardDescription: '500 Gold Coins', coins: 500 },
  { day: 4, rewardDescription: '1 Shuffle Booster + 150 Coins', coins: 150, boosters: { shuffle: 1 } },
  { day: 5, rewardDescription: '750 Gold Coins', coins: 750 },
  { day: 6, rewardDescription: 'Hammer + Undo Boosters', coins: 200, boosters: { hammer: 1, undo: 1 } },
  { day: 7, rewardDescription: 'Grand Treasure: 1,000 Coins, 25 Diamonds & Rainbow Surge!', coins: 1000, diamonds: 25, boosters: { rainbow: 1, hammer: 1, shuffle: 1, hint: 1, undo: 1 } },
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'complete_3_levels',
    title: 'Explorer Path',
    description: 'Complete 3 puzzle levels',
    target: 3,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 200,
    rewardBooster: { type: 'hint', count: 1 },
  },
  {
    id: 'pure_talent',
    title: 'Pure Talent',
    description: 'Complete a level without using any boosters',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 250,
    rewardBooster: { type: 'undo', count: 1 },
  },
  {
    id: 'earn_10_stars',
    title: 'Star Collector',
    description: 'Earn 10 stars across puzzle stages',
    target: 10,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 300,
    rewardBooster: { type: 'shuffle', count: 1 },
  },
  {
    id: 'make_25_matches',
    title: 'Combo Weaver',
    description: 'Perform 25 gem matches',
    target: 25,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 250,
    rewardBooster: { type: 'hammer', count: 1 },
  },
  {
    id: 'complete_5_levels',
    title: 'Master Adventurer',
    description: 'Complete 5 puzzle levels',
    target: 5,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 400,
    rewardBooster: { type: 'rainbow', count: 1 },
  },
];

export interface ShopItem {
  id: string;
  name: string;
  type: 'single' | 'bundle';
  boosterType?: 'hint' | 'shuffle' | 'undo' | 'hammer' | 'rainbow';
  amount: number;
  costCoins: number;
  icon: string;
  description: string;
}

export const BOOSTER_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_hint',
    name: 'Mystic Hint',
    type: 'single',
    boosterType: 'hint',
    amount: 1,
    costCoins: 100,
    icon: '💡',
    description: 'Highlights a guaranteed matching move when you need guidance.',
  },
  {
    id: 'shop_shuffle',
    name: 'Vortex Shuffle',
    type: 'single',
    boosterType: 'shuffle',
    amount: 1,
    costCoins: 150,
    icon: '🔄',
    description: 'Reshuffles all tiles on the board into fresh match opportunities.',
  },
  {
    id: 'shop_undo',
    name: 'Chrono Undo',
    type: 'single',
    boosterType: 'undo',
    amount: 1,
    costCoins: 150,
    icon: '⏪',
    description: 'Reverses your most recent move, restoring your moves and score.',
  },
  {
    id: 'shop_hammer',
    name: 'Titan Hammer',
    type: 'single',
    boosterType: 'hammer',
    amount: 1,
    costCoins: 200,
    icon: '🔨',
    description: 'Smashes and collects any selected crystal immediately.',
  },
  {
    id: 'shop_rainbow',
    name: 'Magic Match (Rainbow)',
    type: 'single',
    boosterType: 'rainbow',
    amount: 1,
    costCoins: 250,
    icon: '🌈',
    description: 'Transforms 4 board crystals into your exact objective gem type!',
  },
  {
    id: 'shop_bundle',
    name: 'Grand Mage Bundle',
    type: 'bundle',
    amount: 1,
    costCoins: 750,
    icon: '✨',
    description: 'Special value pack: 1 Hint, 1 Shuffle, 1 Undo, 1 Hammer, and 1 Rainbow Surge!',
  },
];
