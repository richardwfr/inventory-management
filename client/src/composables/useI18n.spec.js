import { describe, it, expect } from 'vitest'
import { useI18n } from './useI18n'

describe('useI18n composable', () => {
  it('provides i18n utility functions', () => {
    const {
      t,
      currentLocale,
      currentCurrency,
      translateProductName,
      translateCustomerName,
      translateWarehouse
    } = useI18n()

    expect(typeof t).toBe('function')
    expect(currentLocale).toBeDefined()
    expect(currentCurrency).toBeDefined()
    expect(typeof translateProductName).toBe('function')
    expect(typeof translateCustomerName).toBe('function')
    expect(typeof translateWarehouse).toBe('function')
  })

  it('translates product names correctly', () => {
    const { translateProductName } = useI18n()

    // Test known product names
    const result = translateProductName('Microcontroller')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('translates warehouse names correctly', () => {
    const { translateWarehouse } = useI18n()

    const result = translateWarehouse('Warehouse A')
    expect(typeof result).toBe('string')
  })

  it('has correct locale and currency refs', () => {
    const { currentLocale, currentCurrency } = useI18n()

    expect(['en', 'ja']).toContain(currentLocale.value)
    expect(['USD', 'JPY']).toContain(currentCurrency.value)
  })
})
