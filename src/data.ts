import { Level } from './types';

export const INITIAL_LEVELS: Level[] = [
  { id: 1, name: 'Awakening', stars: 0, isLocked: false, isBoss: false, recommendedPower: 800, loot: 'Standard Crystal x5' },
  { id: 2, name: 'Broken Bridge', stars: 0, isLocked: true, isBoss: false, recommendedPower: 950, loot: 'Gold x100, Prism Shard' },
  { id: 3, name: 'Sunken Shrine', stars: 0, isLocked: true, isBoss: false, recommendedPower: 1100, loot: 'Rare Crystal x3' },
  { id: 4, name: 'Mossy Gorge', stars: 0, isLocked: true, isBoss: false, recommendedPower: 1250, loot: 'Gold x200, Elixir x1' },
  { id: 5, name: 'Whispering Winds', stars: 0, isLocked: true, isBoss: false, recommendedPower: 1400, loot: 'Mystic Gem x2' },
  { id: 6, name: 'Obsidian Caverns', stars: 0, isLocked: true, isBoss: false, recommendedPower: 1600, loot: 'Legendary Shard x1' },
  { id: 7, name: 'Glacial Spires', stars: 0, isLocked: true, isBoss: false, recommendedPower: 1800, loot: 'Ice Crystal x4' },
  { id: 8, name: 'Storm Ridge', stars: 0, isLocked: true, isBoss: false, recommendedPower: 2000, loot: 'Storm Core x1' },
  { id: 9, name: 'Celestial Spire', stars: 0, isLocked: true, isBoss: false, recommendedPower: 2200, loot: 'Star Dust x10' },
  { id: 10, name: 'Aether Dragon', stars: 0, isLocked: true, isBoss: true, recommendedPower: 5000, loot: 'Sunstone Shard, 1000 Gems' }
];
