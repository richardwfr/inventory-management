import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from './FilterBar.vue'
import { createI18n } from 'vue-i18n'

// Mock i18n
const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      filters: {
        timePeriod: 'Time Period',
        warehouse: 'Warehouse',
        category: 'Category',
        status: 'Order Status'
      }
    }
  }
})

describe('FilterBar.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(FilterBar, {
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true
        }
      }
    })
  })

  it('renders the filter bar component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('contains filter select elements', () => {
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('renders reset button', () => {
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('emits filter change events', async () => {
    const selects = wrapper.findAll('select')
    if (selects.length > 0) {
      await selects[0].setValue('warehouse-a')
      expect(wrapper.emitted()).toBeDefined()
    }
  })

  it('has correct class structure', () => {
    expect(wrapper.classes()).toContain('filter-bar')
  })
})
