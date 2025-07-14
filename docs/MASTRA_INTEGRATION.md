# Mastra Agents Integration for Question Feedback Resolution

This document describes the integration of Mastra AI agents into the Juvenotes platform for automated question feedback resolution.

## Overview

The Mastra integration provides AI-powered assistance for resolving student feedback on questions. It analyzes feedback text and provides resolution suggestions to help educators address student concerns more efficiently.

## Features

- **Automated Feedback Analysis**: AI-powered analysis of student feedback to categorize and understand issues
- **Resolution Suggestions**: Contextual suggestions for resolving different types of feedback
- **Bulk Processing**: Process multiple feedback items at once
- **API Integration**: RESTful API endpoints for frontend integration
- **CLI Commands**: Command-line tools for batch operations
- **Database Integration**: Seamless integration with existing QuestionFeedback model

## Installation

The Mastra packages are already installed as part of the project dependencies:

```bash
npm install @mastra/core mastra @mastra/pg
```

## Configuration

### Environment Variables

Add the following optional environment variables to your `.env` file:

```env
# Mastra Configuration (Optional)
MASTRA_TELEMETRY_ENABLED=false
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
LLM_MODEL=gpt-4o-mini
FEEDBACK_AGENT_MODEL=gpt-4o-mini
```

### Configuration File

The Mastra configuration is defined in `config/mastra.ts`:

```typescript
export const mastraConfig = {
  // AI/LLM provider configuration
  llm: {
    provider: 'azure-openai',
    apiKey: env.get('AZURE_OPENAI_API_KEY', ''),
    endpoint: env.get('AZURE_OPENAI_ENDPOINT', ''),
    apiVersion: env.get('AZURE_OPENAI_API_VERSION', '2024-02-01'),
    deploymentName: env.get('AZURE_OPENAI_DEPLOYMENT_NAME', ''),
    model: env.get('LLM_MODEL', 'gpt-4o-mini'),
  },
  
  // Agent configuration
  agents: {
    questionFeedbackResolver: {
      enabled: true,
      model: env.get('FEEDBACK_AGENT_MODEL', 'gpt-4o-mini'),
      systemPrompt: `You are a helpful assistant that analyzes question feedback...`,
    },
  },
}
```

## API Endpoints

The following API endpoints are available under `/api/mastra/`:

### Get Feedback Statistics
```
GET /api/mastra/feedback/stats
```

Returns statistics about feedback items (total, resolved, unresolved, recently added).

### List Unresolved Feedback
```
GET /api/mastra/feedback
```

Returns a list of all unresolved feedback items with question and user details.

### Get Specific Feedback
```
GET /api/mastra/feedback/:id
```

Returns details for a specific feedback item.

### Process Feedback
```
POST /api/mastra/feedback/:id/process
```

Analyzes feedback and returns AI-generated resolution suggestions without marking as resolved.

### Resolve Feedback
```
POST /api/mastra/feedback/:id/resolve
```

Body (optional):
```json
{
  "resolution": "Custom resolution text"
}
```

Resolves feedback with either AI-generated or custom resolution text.

### Bulk Process
```
POST /api/mastra/feedback/bulk-process
```

Body:
```json
{
  "feedbackIds": [1, 2, 3]
}
```

Processes multiple feedback items and returns resolution suggestions for each.

### Bulk Resolve
```
POST /api/mastra/feedback/bulk-resolve
```

Body:
```json
{
  "feedbackIds": [1, 2, 3],
  "resolution": "Optional common resolution"
}
```

Resolves multiple feedback items at once.

## CLI Commands

### Feedback Statistics
```bash
node ace mastra:feedback stats
```

### Process Single Feedback
```bash
node ace mastra:feedback process [feedbackId]
```

### Resolve Single Feedback
```bash
node ace mastra:feedback resolve [feedbackId] --resolution="Custom resolution"
```

### Process All Unresolved Feedback
```bash
node ace mastra:feedback process-all
```

### Resolve All Unresolved Feedback
```bash
node ace mastra:feedback resolve-all --userId=1
```

## Usage Examples

### Process Feedback via API

```javascript
// Process feedback and get suggestions
const response = await fetch('/api/mastra/feedback/123/process', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
console.log('Resolution:', result.resolution)
console.log('Suggestions:', result.suggestions)
```

### Resolve Feedback with Custom Text

```javascript
// Resolve with custom resolution
const response = await fetch('/api/mastra/feedback/123/resolve', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resolution: 'Thank you for the feedback. The answer has been corrected.'
  })
})
```

### Bulk Operations

```javascript
// Process multiple feedback items
const response = await fetch('/api/mastra/feedback/bulk-process', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    feedbackIds: [1, 2, 3, 4, 5]
  })
})

const results = await response.json()
results.data.forEach(result => {
  console.log(`Feedback ${result.feedbackId}:`, result.resolution)
})
```

## Resolution Categories

The AI agent categorizes feedback into different types and provides appropriate resolutions:

### Error/Incorrect Content
- **Triggers**: "wrong", "incorrect", "error"
- **Resolution**: Reviews content accuracy and suggests verification
- **Suggestions**: Check facts, verify answers, update if needed

### Clarity Issues
- **Triggers**: "unclear", "confusing", "difficult to understand"
- **Resolution**: Suggests improving question clarity
- **Suggestions**: Reword questions, add context, simplify language

### Difficulty Level
- **Triggers**: "too difficult", "too hard", "too easy"
- **Resolution**: Reviews question difficulty appropriateness
- **Suggestions**: Adjust complexity, align with learning objectives

### General Feedback
- **Default**: Any feedback not matching specific patterns
- **Resolution**: Generic guidance for review and improvement
- **Suggestions**: Analyze content, determine improvements

## Integration with Existing System

The Mastra integration seamlessly works with the existing QuestionFeedback model:

- Uses existing database schema (no migrations required)
- Maintains compatibility with current feedback workflows
- Extends functionality without breaking existing features
- Integrates with AdonisJS authentication and authorization

## Future Enhancements

1. **Real AI Integration**: Connect to actual LLM providers (OpenAI, Anthropic, etc.)
2. **Advanced Categorization**: More sophisticated feedback analysis
3. **Learning from Resolutions**: Train on successful resolution patterns
4. **Automated Actions**: Automatically apply simple fixes
5. **Integration with Question Editor**: Direct question updates from resolutions
6. **Analytics Dashboard**: Track resolution effectiveness and patterns

## Development Notes

The current implementation includes:

- **Service Layer**: `app/services/mastra_service.ts` - Core logic
- **API Controller**: `app/controllers/api/feedback_mastra_controller.ts` - REST endpoints
- **CLI Command**: `commands/mastra_feedback.ts` - Command line interface
- **Configuration**: `config/mastra.ts` - Settings and agent configuration
- **Routes**: API routes in `start/routes.ts`

The system is designed to be easily extendable and can be enhanced with real AI providers when ready.