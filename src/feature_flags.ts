/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A light weight implementation of feature flags to conditionally enable
 * experimental and legacy features.
 */
export class FeatureFlags<FlagsList extends Record<any, any>> {
  #flags?: FlagsList
  #flagsFactory?: () => FlagsList

  constructor(flags: FlagsList | (() => FlagsList)) {
    if (typeof flags === 'function') {
      this.#flagsFactory = flags
    } else {
      this.#flags = flags
    }
  }

  enabled<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return flags[feature as keyof FlagsList] === true
  }

  disabled<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return flags[feature as keyof FlagsList] === false
  }

  has<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return feature in flags
  }

  when<Feature extends keyof FlagsList | (string & {}), EnabledResult, DisabledResult>(
    feature: Feature,
    enabledCallback: () => EnabledResult,
    disabledCallback?: () => DisabledResult
  ): [never] extends DisabledResult ? EnabledResult | undefined : EnabledResult | DisabledResult {
    if (this.enabled(feature)) {
      return enabledCallback()
    }

    return (disabledCallback ? disabledCallback() : undefined) as [never] extends DisabledResult
      ? EnabledResult | undefined
      : EnabledResult | DisabledResult
  }
}
