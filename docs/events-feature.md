# Events Feature Documentation

## Overview

The Events feature allows users to create, manage, and participate in various types of educational events such as webinars, workshops, conferences, exams, seminars, and meetings.

## Architecture

### Database Schema

The events system is built around a single `events` table with the following key fields:

- **Basic Information**: `title`, `slug`, `description`, `content`
- **Event Details**: `event_type`, `status`, `start_date`, `end_date`, `registration_deadline`
- **Location**: `venue`, `address`, `online_link`, `is_online`
- **Pricing**: `is_free`, `price`, `currency`
- **Capacity**: `max_participants`, `current_participants`
- **Metadata**: JSON field for additional event information
- **Soft Delete**: `deleted_at` for soft deletion support

### Models

#### Event Model (`app/models/event.ts`)
- Full Lucid ORM model with relationships
- Belongs to User (creator)
- Soft delete functionality
- JSON metadata field support

#### User Model Enhancement
- Added `hasMany` relationship to Events

### DTOs

#### EventDto (`app/dtos/event.ts`)
- Data transfer object for API responses
- Includes user relationship data
- Properly serializes DateTime fields

### Validators

#### Event Validators (`app/validators/event.ts`)
- `createEventValidator`: Validates event creation
- `updateEventValidator`: Validates event updates
- Supports comprehensive metadata schema
- DateTime transformation from Date to Luxon DateTime

### Controllers

#### IndexEventsController (`app/controllers/events/index_events_controller.ts`)
User-facing functionality:
- `index()`: List published events with filtering
- `show()`: Display single event details
- `register()`: Register for an event (basic implementation)

#### ManageEventsController (`app/controllers/manage/events/manage_events_controller.ts`)
Admin functionality:
- `index()`: List all events for management
- `create()`: Show event creation form
- `store()`: Create new event
- `show()`: Show event details for management
- `edit()`: Show event edit form
- `update()`: Update existing event
- `destroy()`: Soft delete event

### Routes

#### Public Routes (`/events`)
- `GET /events` - List events
- `GET /events/:slug` - View event details
- `POST /events/:slug/register` - Register for event

#### Admin Routes (`/manage/events`)
- `GET /manage/events` - List events for management
- `GET /manage/events/create` - Event creation form
- `POST /manage/events` - Create event
- `GET /manage/events/:slug` - View event (admin)
- `GET /manage/events/:slug/edit` - Edit event form
- `PUT /manage/events/:slug` - Update event
- `DELETE /manage/events/:slug` - Delete event

## Event Types

The system supports the following event types:
- `webinar`: Online presentations
- `workshop`: Interactive learning sessions
- `conference`: Large educational gatherings
- `exam`: Assessment events
- `seminar`: Academic discussions
- `meeting`: General meetings
- `other`: Custom event types

## Event Statuses

Events can have the following statuses:
- `draft`: Not yet published
- `published`: Available for registration
- `cancelled`: Event cancelled
- `completed`: Event has finished

## Features

### Event Management
- Create and edit events with rich metadata
- Automatic slug generation from titles
- Soft deletion support
- File upload support through metadata

### Registration System
- Basic participant counting
- Registration deadline enforcement
- Capacity management
- Extensible for future payment integration

### Search and Filtering
- Search by title and description
- Filter by event type and status
- Pagination support

### Validation
- Comprehensive form validation
- Date validation (end date must be after start date)
- URL validation for online links
- Enum validation for types and statuses

## API Endpoints

### Public API
```
GET /events?search=query&eventType=webinar&status=published&page=1
GET /events/{slug}
POST /events/{slug}/register
```

### Admin API
```
GET /manage/events?search=query&status=draft&eventType=workshop&page=1
POST /manage/events
GET /manage/events/{slug}
PUT /manage/events/{slug}
DELETE /manage/events/{slug}
```

## Testing

### Unit Tests
- Event model tests (`tests/unit/models/event.spec.ts`)
- Basic CRUD operations
- Relationship testing
- Soft delete functionality

### Functional Tests
- Route accessibility tests (`tests/functional/events/index.spec.ts`)
- Data structure validation
- Basic endpoint testing

## Future Enhancements

1. **User Registration System**: Implement a `user_event_registrations` table for proper registration tracking
2. **Payment Integration**: Add payment processing for paid events
3. **Email Notifications**: Send confirmation emails for registrations
4. **Calendar Integration**: iCal export functionality
5. **Event Analytics**: Track registration metrics and attendance
6. **Recurring Events**: Support for repeating events
7. **Event Categories**: Add event categorization system
8. **Waiting Lists**: Handle oversubscribed events
9. **Event Reviews**: Allow participants to review events
10. **Multi-language Support**: Internationalization for event content

## Migration

To set up the events feature:

1. Run the migration:
   ```bash
   node ace migration:run
   ```

2. The migration will create the `events` table with all necessary fields and indexes.

## Security Considerations

- All routes require authentication
- Admin routes should include proper authorization checks
- Event creation is limited to authenticated users
- Soft deletes prevent accidental data loss
- Input validation prevents malicious data entry

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large event lists
- Efficient preloading of relationships
- Optimized search queries with ILIKE for PostgreSQL