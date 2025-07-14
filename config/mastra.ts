import env from '#start/env'

export const mastraConfig = {
  // Basic Mastra configuration for AdonisJS integration

  // Database connection details (using same as Lucid)
  database: {
    client: 'pg',
    connection: {
      host: env.get('DB_HOST'),
      port: env.get('DB_PORT'),
      user: env.get('DB_USER'),
      password: env.get('DB_PASSWORD'),
      database: env.get('DB_DATABASE'),
    },
  },

  // AI/LLM provider configuration
  llm: {
    provider: 'openai', // Default to OpenAI
    apiKey: env.get('OPENAI_API_KEY', ''), // Optional OpenAI key
    model: env.get('LLM_MODEL', 'gpt-3.5-turbo'), // Default model
  },

  // Agent configuration
  agents: {
    questionFeedbackResolver: {
      enabled: true,
      model: env.get('FEEDBACK_AGENT_MODEL', 'gpt-3.5-turbo'),
      systemPrompt: `You are a helpful assistant that analyzes question feedback and provides resolution suggestions. 
        You help resolve student feedback about questions in an educational platform.
        Always be constructive and provide actionable suggestions.`,
    },
  },

  // Logging and telemetry
  telemetry: {
    enabled: env.get('MASTRA_TELEMETRY_ENABLED', 'false') === 'true',
  },
}

export default mastraConfig
