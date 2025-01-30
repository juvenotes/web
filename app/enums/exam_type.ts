export enum ExamType {
  CAT = 'cat',
  EOY = 'eoy', // End of Year
}

export enum PaperType {
  MCQ = 'mcq',
  SAQ = 'saq',
  MIXED = 'mixed',
  OSCE = 'osce',
}

export const PaperTypeLabels = {
  [PaperType.MCQ]: 'Multiple Choice Questions (MCQ)',
  [PaperType.SAQ]: 'Short Answer Questions (SAQ)',
  [PaperType.MIXED]: 'Mixed MCQ and SAQ',
  [PaperType.OSCE]: 'Objective Structured Clinical Examination (OSCE)',
}

export const ExamTypeLabels = {
  [ExamType.EOY]: 'End of Year Exam (EOY)',
  [ExamType.CAT]: 'Continuous Assessment Test (CAT)',
}
