import { Level, GemType } from './types';

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
  
  let objectiveTarget = 15 + Math.floor((i - 1) * 1.5);
  if (isBoss) objectiveTarget = Math.floor(objectiveTarget * 1.3);

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
