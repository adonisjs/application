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
 *
 * @template FlagsList - Type definition for the feature flags object
 *
 * @example
 * const flags = new FeatureFlags({ newUI: true, betaFeature: false })
 * if (flags.enabled('newUI')) {
 *   // Enable new UI
 * }
 *
 * @example
 * const dynamicFlags = new FeatureFlags(() => getConfigFlags())
 * flags.when('betaFeature',
 *   () => console.log('Beta enabled'),
 *   () => console.log('Beta disabled')
 * )
 */
export class FeatureFlags<FlagsList extends Record<any, any>> {
  /**
   * Static flags object containing feature flag values.
   * Used when flags are provided as a static object during construction.
   *
   * @private
   * @type {FlagsList | undefined}
   */
  #flags?: FlagsList

  /**
   * Factory function to generate flags dynamically.
   * Used when flags need to be computed at runtime.
   *
   * @private
   * @type {(() => FlagsList) | undefined}
   */
  #flagsFactory?: () => FlagsList

  /**
   * Creates a new FeatureFlags instance
   *
   * @param flags - Either a static flags object or a factory function
   */
  constructor(flags: FlagsList | (() => FlagsList)) {
    if (typeof flags === 'function') {
      this.#flagsFactory = flags
    } else {
      this.#flags = flags
    }
  }

  /**
   * Checks if a feature is enabled
   *
   * @param feature - The feature name to check
   * @returns boolean - True if the feature is enabled
   */
  enabled<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return flags[feature as keyof FlagsList] === true
  }

  /**
   * Checks if a feature is disabled
   *
   * @param feature - The feature name to check
   * @returns boolean - True if the feature is disabled
   */
  disabled<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return flags[feature as keyof FlagsList] === false
  }

  /**
   * Checks if a feature exists in the flags
   *
   * @param feature - The feature name to check
   * @returns boolean - True if the feature exists
   */
  has<Feature extends keyof FlagsList | (string & {})>(feature: Feature): boolean {
    const flags = this.#flags ?? this.#flagsFactory!()
    return feature in flags
  }

  /**
   * Conditionally executes callbacks based on feature flag state
   *
   * @param feature - The feature name to check
   * @param enabledCallback - Callback to execute when feature is enabled
   * @param disabledCallback - Optional callback to execute when feature is disabled
   * @returns The result of the executed callback
   */
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
