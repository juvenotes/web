# Quiz Modes Implementation Guide

## Overview
The Juvenotes event quiz system now supports two distinct quiz modes:

### 1. Standard Mode (default)
- **Behavior**: Traditional quiz with immediate feedback
- **Features**:
  - Shows correct/incorrect answers immediately after selection
  - Cannot change answers once selected
  - No timer or authentication required
  - Visual feedback with explanations
- **Use Case**: Regular practice quizzes and learning assessments

### 2. Timed Lockdown Mode
- **Behavior**: Exam-style timed quiz with security features
- **Features**:
  - Pre-quiz authentication (Full Name, Student ID, School)
  - 2-hour countdown timer
  - Tab switching and focus detection
  - Can change answers within time limit
  - Auto-submit on time expiration or suspicious activity
  - No immediate feedback on correctness
- **Use Case**: Formal examinations and competitive assessments

## Database Schema

### Migration
```sql
ALTER TABLE event_quizzes ADD COLUMN quiz_mode ENUM('standard', 'timed_lockdown') DEFAULT 'standard';
```

### Model Fields
- `quiz_mode`: 'standard' | 'timed_lockdown' (defaults to 'standard')
- `duration_minutes`: Timer duration (only used in timed_lockdown mode)
- `has_timer`: Boolean flag for timer functionality
- `lockdown_mode`: Boolean flag for lockdown features
- `auto_submit`: Boolean flag for auto-submission

## Configuration

### Setting Up Standard Mode Quiz
```typescript
const quiz = {
  quiz_mode: 'standard',
  has_timer: false,
  lockdown_mode: false,
  auto_submit: false
}
```

### Setting Up Timed Lockdown Mode Quiz
```typescript
const quiz = {
  quiz_mode: 'timed_lockdown',
  duration_minutes: 120,
  has_timer: true,
  lockdown_mode: true,
  auto_submit: true
}
```

## User Experience

### Standard Mode Flow
1. Student navigates to quiz
2. Questions are immediately available
3. Click answer → immediate feedback (correct/incorrect + explanation)
4. Cannot change answer after selection
5. Click "View Results" to see final score

### Timed Lockdown Mode Flow
1. Student navigates to quiz
2. Authentication dialog appears (Name, Student ID, School)
3. Timer starts immediately after authentication
4. Click answers → confirmation message (no correctness revealed)
5. Can change answers freely within time limit
6. Auto-submit when time expires OR manual submit
7. Results shown after submission

## API Changes

No new endpoints required. Existing endpoints handle both modes:
- Standard mode: Uses existing answer submission
- Timed lockdown mode: Uses session-based submission with timer tracking

## Visual Indicators

- **Mode Badge**: Green "Standard Quiz" or Red "Timed Quiz"
- **Timer**: Only visible in timed lockdown mode
- **Answer Styling**:
  - Standard: Green (correct), Red (incorrect), Locked after selection
  - Timed Lockdown: Blue (selected), Can be changed

## Backward Compatibility

- All existing quizzes automatically use standard mode (via default value)
- No breaking changes to existing API or UI
- Enhanced components gracefully degrade for standard mode

## Migration Instructions

1. Run database migration: `node ace migration:run`
2. Configure quiz mode in admin interface
3. Set timer and lockdown options as needed
4. Test both modes before going live

## Implementation Files

- `database/migrations/1757922000000_add_quiz_mode_to_event_quizzes_table.ts`
- `app/models/event_quiz.ts` - Added quizMode field
- `app/dtos/event_quiz.ts` - Added quizMode field
- `inertia/pages/events/quiz.vue` - Dual mode logic
- `inertia/components/quiz/QuizAuthenticationDialog.vue` - Authentication
- `inertia/components/quiz/QuizTimer.vue` - Timer functionality
- `inertia/components/quiz/LockdownDetector.vue` - Security monitoring