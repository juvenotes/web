import { Request } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import crypto from 'node:crypto'
import { IP2Location } from 'ip2location-nodejs'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import redis from '@adonisjs/redis/services/main'

export default class IdentityService {
  protected static key: string = env.get('IDENTITY_SECRET')

  static async getLocation(ip: string | undefined) {
    const fallback = {
      city: undefined,
      countryLong: undefined,
      countryShort: undefined,
      latitude: null,
      longitude: null,
    }
    if (app.inTest || !ip) return fallback

    try {
      const ip2Location = new IP2Location()
      const version = ip.includes(':') ? 'IPV6' : 'IPV4'
      const bin = app.publicPath(`ip2location/DB5.${version}.BIN`)

      ip2Location.open(bin)

      const data = ip2Location.getAll(ip)

      ip2Location.close()

      return {
        ...data,
        latitude: data.latitude !== null ? Number(data.latitude) : null,
        longitude: data.longitude !== null ? Number(data.longitude) : null,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      logger.error({ error: errorMessage }, 'IdentityService.getLocation error')
      return fallback
    }
  }

  // Rest of your implementation remains the same
  static async getRequestIdentity(request: Request) {
    const ip = request.ip()
    const agent = request.header('user-agent')
    return this.create(ip, agent || '')
  }

  static async getIdentity(ip: string, agent: string) {
    return this.create(ip, agent)
  }

  static generateName(): string {
    const adjectives = ['happy', 'clever', 'brave', 'wise', 'calm', 'kind', 'fast']
    const nouns = ['rabbit', 'tiger', 'eagle', 'wolf', 'dolphin', 'fox', 'owl']

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 1000)

    return `${adjective}${noun}${number}`
  }

  static async create(ip: string, agent: string): Promise<string> {
    const secret = await this.secret()
    return crypto.createHash('md5').update(`${secret}${ip}${agent}`).digest('hex')
  }

  private static async secret() {
    let secret = await redis.get(this.key)

    if (!secret) {
      secret = crypto.randomBytes(16).toString('base64')
      await redis.set(this.key, secret)
    }

    return secret
  }
}
