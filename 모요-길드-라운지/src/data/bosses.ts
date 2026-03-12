export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'CHAOS' | 'EXTREME';

export interface BossDifficulty {
  level: Difficulty;
  price: number;
}

export interface Boss {
  id: string;
  name: string;
  difficulties: BossDifficulty[];
  type?: 'WEEKLY' | 'SEASONAL' | 'MONTHLY';
}

export const BOSSES: Boss[] = [
  // 주간보스
  { id: 'papulatus', name: '파풀라투스', type: 'WEEKLY', difficulties: [{ level: 'CHAOS', price: 13800000 }] },
  { id: 'suu', name: '스우', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 17600000 }, { level: 'HARD', price: 54200000 }, { level: 'EXTREME', price: 604000000 }] },
  { id: 'demian', name: '데미안', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 18400000 }, { level: 'HARD', price: 51500000 }] },
  { id: 'slime', name: '가엔슬', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 26800000 }, { level: 'CHAOS', price: 79100000 }] },
  { id: 'lucid', name: '루시드', type: 'WEEKLY', difficulties: [{ level: 'EASY', price: 31400000 }, { level: 'NORMAL', price: 37500000 }, { level: 'HARD', price: 66200000 }] },
  { id: 'will', name: '윌', type: 'WEEKLY', difficulties: [{ level: 'EASY', price: 34000000 }, { level: 'NORMAL', price: 43300000 }, { level: 'HARD', price: 81200000 }] },
  { id: 'dusk', name: '더스크', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 46300000 }, { level: 'CHAOS', price: 73500000 }] },
  { id: 'jinhilla', name: '진힐라', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 74900000 }, { level: 'HARD', price: 112000000 }] },
  { id: 'dunkel', name: '듄켈', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 50000000 }, { level: 'HARD', price: 99400000 }] },
  { id: 'seren', name: '세렌', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 266000000 }, { level: 'HARD', price: 396000000 }, { level: 'EXTREME', price: 3150000000 }] },
  { id: 'kalos', name: '칼로스', type: 'WEEKLY', difficulties: [{ level: 'EASY', price: 311000000 }, { level: 'NORMAL', price: 561000000 }, { level: 'CHAOS', price: 1340000000 }, { level: 'EXTREME', price: 4320000000 }] },
  { id: 'daejeokja', name: '대적자', type: 'WEEKLY', difficulties: [{ level: 'EASY', price: 324000000 }, { level: 'NORMAL', price: 589000000 }, { level: 'HARD', price: 1510000000 }, { level: 'EXTREME', price: 4960000000 }] },
  { id: 'karing', name: '카링', type: 'WEEKLY', difficulties: [{ level: 'EASY', price: 419000000 }, { level: 'NORMAL', price: 714000000 }, { level: 'HARD', price: 1830000000 }, { level: 'EXTREME', price: 5670000000 }] },
  { id: 'hyungseong', name: '흉성', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 658000000 }, { level: 'HARD', price: 2819000000 }] },
  { id: 'limbo', name: '림보', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 1080000000 }, { level: 'HARD', price: 2510000000 }] },
  { id: 'baldrix', name: '발드릭스', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 1440000000 }, { level: 'HARD', price: 3240000000 }] },
  { id: 'jupiter', name: '유피테르', type: 'WEEKLY', difficulties: [{ level: 'NORMAL', price: 1700000000 }, { level: 'HARD', price: 5100000000 }] },
  
  // 챌섭한정 시즌주간보스
  { id: 'kai', name: '카이', type: 'SEASONAL', difficulties: [{ level: 'NORMAL', price: 300000000 }, { level: 'HARD', price: 600000000 }] },
  
  // 월간보스
  { id: 'blackmage', name: '검은마법사', type: 'MONTHLY', difficulties: [{ level: 'HARD', price: 700000000 }, { level: 'EXTREME', price: 9200000000 }] },
];
