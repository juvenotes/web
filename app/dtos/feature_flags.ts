import { BaseDto } from '@adocasts.com/dto/base'

export default class FeatureFlagsDto extends BaseDto {
  declare experimentVariant: string
  declare featureEnabled: boolean
  declare config: Record<string, any>

  constructor(flags: {
    experimentVariant: string
    featureEnabled: boolean
    config: Record<string, any>
  }) {
    super()
    this.experimentVariant = flags.experimentVariant
    this.featureEnabled = flags.featureEnabled
    this.config = flags.config
  }
}
