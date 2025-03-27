import { Request } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import crypto from 'node:crypto'
import { IP2Location } from 'ip2location-nodejs'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import redis from '@adonisjs/redis/services/main'
import fs from 'node:fs/promises'
import path from 'node:path'
// import axios from 'axios'

export default class IdentityService {
  protected static key: string = env.get('IDENTITY_SECRET')
  protected static cacheDir: string = app.tmpPath('ip2location')
  protected static r2Endpoint: string = env.get('R2_IP2LOCATION_ENDPOINT', '')
  protected static r2AccessKey: string = env.get('R2_ACCESS_KEY_ID', '')
  protected static r2SecretKey: string = env.get('R2_SECRET_ACCESS_KEY', '')

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
      const filename = `DB5.${version}.BIN`

      // Check for local file first (for development)
      let binPath = app.publicPath(`ip2location/${filename}`)
      try {
        await fs.access(binPath)
      } catch {
        // No local file, get from cache or download from R2
        binPath = await this.getR2DatabaseFile(filename)
      }

      ip2Location.open(binPath)
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

  /**
   * Gets database file from local cache or downloads from R2
   */
  private static async getR2DatabaseFile(filename: string): Promise<string> {
    const cachePath = path.join(this.cacheDir, filename)

    try {
      // Check if file exists in cache and is less than 7 days old
      const stats = await fs.stat(cachePath)
      const fileAge = Date.now() - stats.mtime.getTime()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

      if (fileAge < maxAge) {
        logger.debug(`Using cached IP2Location database: ${cachePath}`)
        return cachePath
      }

      // File is older than 7 days, redownload it
      logger.info(`IP2Location database ${filename} is outdated, downloading fresh copy`)
    } catch (error) {
      // File doesn't exist in cache, need to download
      await fs.mkdir(this.cacheDir, { recursive: true })
    }

    // Download the file from R2
    logger.info(`Downloading IP2Location database ${filename} from R2`)

    try {
      // For public bucket access
      let url = `${this.r2Endpoint}/${filename}`

      // Download the file
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
      }

      // Save the file to cache
      const buffer = await response.arrayBuffer()
      await fs.writeFile(cachePath, Buffer.from(buffer))
      logger.info(`IP2Location database ${filename} downloaded successfully`)

      return cachePath
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        `Failed to download IP2Location database from R2`
      )

      // Check if we have an older version we can use
      try {
        await fs.access(cachePath)
        logger.warn(`Using existing cached IP2Location database despite download failure`)
        return cachePath
      } catch {
        throw new Error(`No IP2Location database available and download failed`)
      }
    }
  }

  // Rest of your methods remain the same
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
