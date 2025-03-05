import redis from '@adonisjs/redis/services/main'

export default class SearchCacheService {
  /**
   * Cache prefix for search results
   */
  private resultPrefix = 'search:results:'

  /**
   * Cache prefix for recent searches
   */
  private recentPrefix = 'search:recent:'

  /**
   * TTL for cached search results (2 hours in seconds)
   */
  private resultsTtl = 7200

  /**
   * Maximum number of recent searches to store per user
   */
  private maxRecentSearches = 5

  /**
   * Get cached search results
   */
  async getCachedResults(query: string, context: string = 'public') {
    const key = `${this.resultPrefix}${context}:${query.toLowerCase()}`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  /**
   * Cache search results
   */
  async cacheResults(query: string, results: any[], context: string = 'public') {
    const key = `${this.resultPrefix}${context}:${query.toLowerCase()}`
    await redis.setex(key, this.resultsTtl, JSON.stringify(results))
  }

  /**
   * Store a recent search and return updated list
   */
  async storeRecentSearch(userId: number, query: string, context: string = 'public') {
    const key = `${this.recentPrefix}${context}:${userId}`

    // Add to the beginning of the list (or create new list)
    await redis.lpush(key, query)

    // Trim to keep only the most recent searches
    await redis.ltrim(key, 0, this.maxRecentSearches - 1)

    // Get the updated list
    return await this.getRecentSearches(userId, context)
  }

  /**
   * Get recent searches for a user
   */
  async getRecentSearches(userId: number, context: string = 'public') {
    const key = `${this.recentPrefix}${context}:${userId}`
    return await redis.lrange(key, 0, this.maxRecentSearches - 1)
  }

  /**
   * Clear recent searches for a user
   */
  async clearRecentSearches(userId: number, context: string = 'public') {
    const key = `${this.recentPrefix}${context}:${userId}`
    await redis.del(key)
  }
}
