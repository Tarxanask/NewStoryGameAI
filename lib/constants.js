const DIFFICULTY_LEVELS = [
  {
    key: 'easy',
    label: 'Easy',
    icon: 'smile',
    maxSteps: 10,
    maxGainPoints: 10,
    maxLosingPoints: 5,
    hiringThreshold: 60,
    extraPrompts: ''
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: 'meh',
    maxSteps: 10,
    maxGainPoints: 7,
    maxLosingPoints: 5,
    hiringThreshold: 70,
  },
  {
    key: 'hard',
    label: 'Hard',
    icon: 'frown',
    maxSteps: 10,
    maxGainPoints: 5,
    maxLosingPoints: 7,
    hiringThreshold: 70,
    extraPrompts: 'Choices should include 1 positive effect and 2 negative effects on hireability'
  },
  {
    key: 'ultraHard',
    label: 'Ultra Hard',
    icon: 'skull-crossbones',
    maxSteps: 10,
    maxGainPoints: 3,
    maxLosingPoints: 9,
    hiringThreshold: 62,
    extraPrompts: 'Choices should include 1 positive effect and 2 negative effects on hireability'
  },
]

const LANGUAGES = [
  { key: 'english', flag: 'https://flagcdn.com/us.svg', label: 'English' },
  { key: 'spanish', flag: 'https://flagcdn.com/es.svg', label: 'Spanish' },
  { key: 'french', flag: 'https://flagcdn.com/fr.svg', label: 'French' },
  { key: 'german', flag: 'https://flagcdn.com/de.svg', label: 'German' },
  { key: 'italian', flag: 'https://flagcdn.com/it.svg', label: 'Italian' },
  { key: 'portuguese', flag: 'https://flagcdn.com/pt.svg', label: 'Portuguese' },
  { key: 'lithuanian', flag: 'https://flagcdn.com/lt.svg', label: 'Lithuanian' },
  { key: 'polish', flag: 'https://flagcdn.com/pl.svg', label: 'Polish' },
  { key: 'russian', flag: 'https://flagcdn.com/ru.svg', label: 'Russian' },
]


const ALLOWED_HTML_TAGS = ["br", "p", "b", "i", "strong", "em", "u"];

export { DIFFICULTY_LEVELS, LANGUAGES , ALLOWED_HTML_TAGS}