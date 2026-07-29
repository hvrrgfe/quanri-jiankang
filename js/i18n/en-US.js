// ===== 英文语言包 =====
const LangEN = {
  // 导航
  nav: { home: 'Today', plan: 'Diet', fitness: 'Exercise', shopping: 'Shopping', mental: 'Mind', profile: 'More' },

  // 通用
  common: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', confirm: 'Confirm',
    back: 'Back', close: 'Close', done: 'Done', next: 'Next', prev: 'Previous',
    search: 'Search', all: 'All', result: 'Result', score: 'Score', date: 'Date',
    noData: 'No data available', settings: 'Settings', about: 'About', version: 'Version 2.0.0',
  },

  // 首页
  home: {
    greeting: ['Good morning', 'Good afternoon', 'Good evening'],
    progress: 'Daily Progress',
    streak: 'Day streak',
    aiSchedule: 'AI Schedule',
    generatePlan: 'Generate Daily Plan',
    aiAssessment: 'AI Health Assessment',
    noSchedule: 'Set API key to generate daily schedule',
  },

  // 饮食
  diet: {
    title: 'Weekly Meal Plan',
    breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
    shopping: 'Shopping List', generate: 'Generate Plan', regen: 'Regenerate',
    empty: 'No meal plan yet',
  },

  // 运动
  fitness: {
    title: 'Exercise', heartRate: 'Heart Rate Zones', maxHR: 'Max', resting: 'Resting',
    aiPlan: 'AI Workout Plan', generate: 'Generate AI Plan', regen: 'Regenerate',
    library: 'Exercise Library', cardio: 'Cardio', upperBody: 'Upper Body',
    lowerBody: 'Lower Body', core: 'Core', stretch: 'Stretch', micro: 'Micro Workouts',
    checkin: 'Workout Check-in', weight: 'Weight Tracking', record: 'Record',
    quickStart: 'Quick Start', posture: 'Posture', sittingAlert: 'Sitting Alert',
  },

  // 心理
  mental: {
    title: 'Mind', breathing: 'Breathing Exercise', intention: 'Daily Intention',
    gratitude: 'Gratitude', cbt: 'Cognitive Tools', assessment: 'Self Assessment',
    assessments: 'Psychological Assessments',
  },

  // 睡眠
  sleep: {
    title: 'Sleep', bedTime: 'Bedtime', wakeTime: 'Wake', quality: 'Quality',
    prep: 'Sleep Prep', stats: 'Weekly Stats', avgBed: 'Avg Bedtime', avgWake: 'Avg Wake',
    avgHours: 'Avg Hours', checklist: 'Sleep Checklist',
  },

  // 设置
  settings: {
    title: 'More', profile: 'Health Profile', editProfile: 'Edit Profile',
    apiKey: 'API Key', backup: 'Backup & Restore', darkMode: 'Dark Mode',
    feedback: 'Feedback', donate: 'Support', reset: 'Reset All Data',
    knowledge: 'Knowledge Base', language: 'Language',
  },

  // 心理测评
  assessment: {
    title: 'Self Assessment', start: 'Start Test', retake: 'Retake',
    result: 'Your Result', history: 'History', noHistory: 'No history yet',
    normCompare: 'Norm Comparison', yourScore: 'Your Score', normAvg: 'Norm Average',
    dimension: 'Dimension Analysis', aiAnalysis: 'AI Analysis',
    questions: 'questions', minutes: 'min', caution: 'Results are for reference only',
    submitNorm: 'Contribute Data',
  },

  // 作息规划
  schedule: {
    routine: 'Daily', meal: 'Meal', work: 'Work', break: 'Break',
    exercise: 'Exercise', leisure: 'Leisure', sleep: 'Sleep',
  },

  // 常模（量表名称翻译）
  scales: {
    'PHQ-9 抑郁筛查量表': 'PHQ-9 Depression Scale',
    'GAD-7 广泛性焦虑量表': 'GAD-7 Anxiety Scale',
    'SDS 抑郁自评量表': 'SDS Self-Rating Depression Scale',
    'SAS 焦虑自评量表': 'SAS Self-Rating Anxiety Scale',
    'SCL-90 症状自评量表（90题完整版）': 'SCL-90 Symptom Checklist',
    'BDI 贝克抑郁问卷': 'BDI Beck Depression Inventory',
    'CES-D 流调中心抑郁量表': 'CES-D Depression Scale',
    'RSES 自尊量表': 'RSES Rosenberg Self-Esteem Scale',
    'SWLS 生活满意度量表': 'SWLS Satisfaction with Life Scale',
    'CD-RISC-10 心理弹性量表': 'CD-RISC-10 Resilience Scale',
    'MAAS 正念注意觉知量表': 'MAAS Mindfulness Scale',
    'FFMQ 五因素正念量表（39题完整版）': 'FFMQ Five Facet Mindfulness',
    'ECR 亲密关系经历量表（36题完整版）': 'ECR Experiences in Close Relationships',
    'PSQI 匹兹堡睡眠质量指数': 'PSQI Pittsburgh Sleep Quality Index',
    'MBI 职业倦怠量表（22题完整版）': 'MBI Maslach Burnout Inventory',
    'SBS 独处行为量表（34题完整版）': 'SBS Solitary Behavior Scale',
    'NEO-FFI 大五人格（60题完整版）': 'NEO-FFI Big Five Personality',
    'EPQ 艾森克人格问卷（88题完整版）': 'EPQ Eysenck Personality Questionnaire',
    'SCARED 儿童焦虑筛查量表（41题完整版）': 'SCARED Child Anxiety Scale',
    'SDQ 长处和困难问卷': 'SDQ Strengths & Difficulties',
  },
};
