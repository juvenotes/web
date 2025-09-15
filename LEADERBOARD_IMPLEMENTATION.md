## Event Quiz Leaderboard Implementation

✅ **Completed:**

1. **Database Setup:**
   - Updated `UserMcqResponse` model to include `'event_quiz'` as a source
   - Created `UserQuizStat` model for aggregated quiz statistics
   - Created migration for `user_quiz_stats` table
   - Updated `EventQuiz` model with relationship to `UserQuizStat`

2. **Backend API:**
   - Created `QuizLeaderboardController` with `show()` and `updateStats()` methods
   - Added DTOs for leaderboard data structure
   - Added validators for quiz stat operations
   - Added API routes for leaderboard data and stats updates

3. **Frontend Implementation:**
   - Created Vue Query composable (`use_quiz_leaderboard.ts`) for real-time data syncing
   - Built responsive leaderboard component (`quiz_leaderboard.vue`) with:
     - Real-time updates every 5 seconds
     - Top 10 rankings with trophy/medal icons
     - Current user highlight
     - Accuracy, time spent, and score metrics
     - Loading and error states
   - Created dedicated leaderboard page (`quiz_leaderboard.vue`)
   - Added leaderboard button to quiz management view

4. **Routes:**
   - Management route: `/manage/events/:slug/quiz/:quizId/leaderboard`
   - API routes:
     - `GET /api/quizzes/:quizId/leaderboard` - Get live leaderboard
     - `POST /api/quizzes/:quizId/stats` - Update user stats

## How it works:

1. **During Quiz:** Users submit answers which are stored in `user_mcq_responses` with `source: 'event_quiz'`
2. **Stats Aggregation:** Quiz completion triggers updates to `user_quiz_stats` table
3. **Real-time Sync:** TanStack Vue Query automatically refetches leaderboard data every 5 seconds
4. **Live Updates:** All participants see real-time ranking changes as others complete questions

## Next Steps:

To fully activate the system, you'll need to:

1. **Integrate with Quiz Taking Flow:** Update your quiz submission logic to:
   - Store responses with `source: 'event_quiz'`
   - Update/create `UserQuizStat` records after each submission
   - Call the `updateStats` API endpoint

2. **Test the System:**
   - Take a quiz and verify responses are stored
   - Check that leaderboard updates in real-time
   - Verify ranking calculations are correct

The foundation is now complete and ready for integration! 🚀
