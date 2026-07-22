import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as api from './api'

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
  return { default: mockAxios }
})

describe('API utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports API methods', () => {
    expect(typeof api.getOrders).toBe('function')
    expect(typeof api.getInventory).toBe('function')
    expect(typeof api.getDashboardSummary).toBe('function')
    expect(typeof api.getRestockRecommendations).toBe('function')
    expect(typeof api.submitRestockOrder).toBe('function')
  })

  it('getOrders function exists and is callable', async () => {
    const result = await api.getOrders({})
    expect(Array.isArray(result) || result === null).toBe(true)
  })

  it('getInventory function exists and is callable', async () => {
    const result = await api.getInventory({})
    expect(Array.isArray(result) || result === null).toBe(true)
  })

  it('getDashboardSummary function exists and is callable', async () => {
    const result = await api.getDashboardSummary({})
    expect(typeof result).toBe('object' || 'number')
  })

  it('getRestockRecommendations accepts budget parameter', async () => {
    const result = await api.getRestockRecommendations(5000)
    expect(Array.isArray(result) || result === null).toBe(true)
  })

  it('submitRestockOrder function exists', () => {
    expect(typeof api.submitRestockOrder).toBe('function')
  })
})
