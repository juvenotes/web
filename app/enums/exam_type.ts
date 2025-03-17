export enum ExamType {
  CAT = 'cat',
  EOY = 'eoy', // End of Year
}

export enum PaperType {
  MCQ = 'mcq',
  SAQ = 'saq',
  MIXED = 'mixed',
  OSCE = 'osce',
  SPOT = 'spot',
}

export const PaperTypeLabels = {
  [PaperType.MCQ]: 'Multiple Choice Questions (MCQ)',
  [PaperType.SAQ]: 'Short Answer Questions (SAQ)',
  [PaperType.MIXED]: 'Mixed MCQ and SAQ',
  [PaperType.OSCE]: 'Objective Structured Clinical Examination (OSCE)',
  [PaperType.SPOT]: 'SPOT exams',
}

export const ExamTypeLabels = {
  [ExamType.EOY]: 'End of Year Exam (EOY)',
  [ExamType.CAT]: 'Continuous Assessment Test (CAT)',
}
