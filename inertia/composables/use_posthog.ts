import posthog from 'posthog-js'

export function usePosthog() {
  posthog.init(import.meta.env.POSTHOG_API_KEY, {
    api_host: import.meta.env.POSTHOG_HOST,
    session_recording: { maskAllInputs: false },
  })
  return { posthog }
}
