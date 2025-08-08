# Event Feature Breakdown

## 1. Event Entity

- **Fields:**
  - Title/Name
  - Description/Details
  - Date & Time
  - Location (physical/virtual)
  - Option links (meeting link, partner websites, etc.)
  - Image (URL or upload)
  - Organizer/Host (optional)

## 2. Event Quiz Entity

- **Fields:**
  - Tied to an Event (event_id)
  - Title/Name
  - Description/Details
  - List of MCQs (multiple per event)
  - Each MCQ:
    - Question text
    - Choices (options)
    - Correct answer
    - Explanation (optional)

## 3. Relationships

- One Event can have multiple Event Quizzes.
- Each Event Quiz contains multiple MCQs.

## 4. UI/UX Considerations

- Event listing page (with image, date, location, links)
- Event details page (with quizzes section)
- Quiz-taking interface (MCQ format)

## 5. UI/UX Implementation Details

### User-Facing Side

- Add an "Event" card to `/learn` alongside other cards.
- **Event Index Page:** Lists all events.
- **Event Show Page:** Displays event details (short description, date, location, image, links) at the top, followed by associated quizzes.
- **Quiz Interface:** Opening a quiz uses `quiz.vue` and matches the MCQ UI used elsewhere.

### Admin Side

- Accessible via `/manage/event`.
- **Event Index Page:** Lists all events with admin controls.
- **Event Show Page:** Shows event details and quizzes, with buttons to create, edit, and delete events/quizzes.
- **Quiz Interface:** Same as user side, with admin controls.
- **Upload Questions:** Reuse logic for uploading questions from file.
- **Image Upload:** Reuse existing image upload logic for event images.
- **Date/Time:** Use Luxon library for datetime handling.

### Development Instructions

- Study how the existing "papers" and "today" pages work, including their backend logic, to guide implementation and reuse patterns/components where possible.
