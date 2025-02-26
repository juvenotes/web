const africanAdjectives = [
  'swift',
  'brave',
  'wise',
  'bold',
  'bright',
  'noble',
  'proud',
  'kind',
  'free',
  'calm',
  'royal',
  'solid',
  'keen',
  'pure',
  'fair',
  'grand',
  'vocal',
  'wild',
  'sure',
  'cool',
]

const africanNouns = {
  swahili: [
    'simba', // lion
    'ndovu', // elephant
    'twiga', // giraffe
    'kifaru', // rhino
    'nyati', // buffalo
    'chui', // leopard
    'nyoni', // bird
    'tai', // eagle
    'kipepeo', // butterfly
    'nyati', // buffalo
    'kiboko', // hippo
    'duma', // cheetah
    'nyuki', // bee
    'kasa', // turtle
    'ndege', // bird
    'korongo', // crane
    'kunguru', // raven
    'manga', // guinea fowl
    'farasi', // horse
    'kayanda', // antelope
  ],
  english: [
    'eagle',
    'falcon',
    'gazelle',
    'zebra',
    'giraffe',
    'dolphin',
    'phoenix',
    'tiger',
    'leopard',
    'antelope',
    'butterfly',
    'robin',
    'crane',
    'turtle',
    'falcon',
  ],
}

type NounType = 'swahili' | 'english'

export function generateUsername(
  options: {
    useNumber?: boolean
    nounType?: NounType | 'random'
  } = {}
): string {
  const {
    useNumber = Math.random() > 0.5, // 50% chance of having a number
    nounType = 'random',
  } = options

  const adjective = africanAdjectives[Math.floor(Math.random() * africanAdjectives.length)]

  // Select noun type
  let nouns: string[]
  if (nounType === 'random') {
    nouns = Math.random() > 0.5 ? africanNouns.swahili : africanNouns.english
  } else {
    nouns = africanNouns[nounType]
  }

  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  if (useNumber) {
    const number = Math.floor(Math.random() * 100)
    return `${adjective}-${noun}-${number}`
  }

  return `${adjective}-${noun}`
}

// Usage examples:
// generateUsername() // random with 50% chance of number
// generateUsername({ useNumber: false }) // never use number
// generateUsername({ nounType: 'swahili' }) // force Swahili nouns
// generateUsername({ nounType: 'english' }) // force English nouns
