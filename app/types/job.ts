export abstract class BaseJob {
  abstract run(...args: any[]): Promise<void>
}

export interface JobConfig {
  key: string
  cronExpression: string
  job: BaseJob
}
