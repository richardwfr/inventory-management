<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Budget Section -->
      <div class="budget-section">
        <div class="budget-card">
          <h3>{{ t('restocking.budget') }}</h3>
          <div class="budget-container">
            <input
              v-model.number="budget"
              type="range"
              min="0"
              max="50000"
              step="100"
              class="budget-slider"
            />
            <div class="budget-display">
              <div class="budget-value">{{ formatCurrency(budget, selectedCurrency) }}</div>
              <div class="budget-label">Available Budget</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations Section -->
      <div class="recommendations-section">
        <h3>{{ t('restocking.recommendations') }}</h3>

        <div v-if="recommendationLoading" class="loading-small">
          {{ t('common.loading') }}
        </div>
        <div v-else-if="recommendations.length === 0" class="no-recommendations">
          <p>{{ t('restocking.noRecommendations') }}</p>
        </div>
        <div v-else class="recommendations-table">
          <div class="table-header">
            <div class="col-sku">SKU</div>
            <div class="col-name">Item Name</div>
            <div class="col-category">Category</div>
            <div class="col-demand">Current Demand</div>
            <div class="col-quantity">Quantity</div>
            <div class="col-unit-cost">Unit Cost</div>
            <div class="col-total">Total</div>
            <div class="col-lead">Lead Time</div>
          </div>
          <div class="table-rows">
            <div v-for="item in recommendations" :key="item.sku" class="table-row">
              <div class="col-sku">{{ item.sku }}</div>
              <div class="col-name">{{ item.name }}</div>
              <div class="col-category">{{ item.category }}</div>
              <div class="col-demand">{{ item.current_demand }}</div>
              <div class="col-quantity">{{ item.quantity }}</div>
              <div class="col-unit-cost">{{ formatCurrency(item.unit_cost, selectedCurrency) }}</div>
              <div class="col-total">{{ formatCurrency(item.total_cost, selectedCurrency) }}</div>
              <div class="col-lead">{{ item.lead_days }} days</div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="recommendations.length > 0" class="summary">
          <div class="summary-row">
            <span class="label">Total Selected Cost:</span>
            <span class="value">{{ formatCurrency(totalSelectedCost, selectedCurrency) }}</span>
          </div>
          <div class="summary-row">
            <span class="label">Remaining Budget:</span>
            <span class="value">{{ formatCurrency(remainingBudget, selectedCurrency) }}</span>
          </div>
          <div class="summary-row">
            <span class="label">Items Count:</span>
            <span class="value">{{ recommendations.length }}</span>
          </div>
          <div class="summary-row">
            <span class="label">Earliest Delivery:</span>
            <span class="value">{{ earliestDelivery }} days</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-section">
        <button
          :disabled="recommendations.length === 0 || submitting"
          class="place-order-btn"
          @click="submitOrder"
        >
          {{ submitting ? t('common.submitting') : t('restocking.placeOrder') }}
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'Restocking',
  setup() {
    const loading = ref(true)
    const error = ref(null)
    const budget = ref(5000)
    const recommendations = ref([])
    const recommendationLoading = ref(false)
    const submitting = ref(false)
    const successMessage = ref(null)
    const { t, selectedCurrency } = useI18n()

    const totalSelectedCost = computed(() => {
      return recommendations.value.reduce((sum, item) => sum + item.total_cost, 0)
    })

    const remainingBudget = computed(() => {
      return Math.max(0, budget.value - totalSelectedCost.value)
    })

    const earliestDelivery = computed(() => {
      if (recommendations.value.length === 0) return 0
      return Math.min(...recommendations.value.map(item => item.lead_days))
    })

    const fetchRecommendations = async () => {
      recommendationLoading.value = true
      try {
        recommendations.value = await api.getRestockRecommendations(budget.value)
      } catch (err) {
        error.value = 'Failed to fetch recommendations'
        console.error(err)
      } finally {
        recommendationLoading.value = false
      }
    }

    const submitOrder = async () => {
      if (recommendations.value.length === 0) {
        error.value = 'Please select items to order'
        return
      }

      submitting.value = true
      successMessage.value = null
      error.value = null

      try {
        const items = recommendations.value.map(rec => ({
          sku: rec.sku,
          quantity: rec.quantity
        }))

        await api.submitRestockOrder(items)

        successMessage.value = 'Order submitted successfully! Check the Orders tab to see your restocking order.'

        // Reset form after 3 seconds
        setTimeout(() => {
          budget.value = 5000
          successMessage.value = null
          fetchRecommendations()
        }, 3000)
      } catch (err) {
        error.value = 'Failed to submit order: ' + (err.response?.data?.detail || err.message)
        console.error(err)
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      loading.value = false
      fetchRecommendations()
    })

    // Re-fetch recommendations when budget changes with debounce to prevent request storms
    watchDebounced(budget, () => {
      fetchRecommendations()
    }, { debounce: 300 })

    return {
      loading,
      error,
      budget,
      recommendations,
      recommendationLoading,
      submitting,
      successMessage,
      totalSelectedCost,
      remainingBudget,
      earliestDelivery,
      submitOrder,
      t,
      selectedCurrency,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.restocking {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.8em;
  color: #0f172a;
}

.loading, .loading-small {
  text-align: center;
  color: #64748b;
  padding: 20px;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.budget-section {
  margin-bottom: 30px;
}

.budget-card {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 25px;
}

.budget-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #0f172a;
  font-size: 1.1em;
}

.budget-container {
  display: flex;
  gap: 30px;
  align-items: center;
}

.budget-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #cbd5e1;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.budget-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.budget-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.budget-display {
  min-width: 200px;
  text-align: right;
}

.budget-value {
  font-size: 1.5em;
  font-weight: 600;
  color: #0f172a;
}

.budget-label {
  font-size: 0.85em;
  color: #64748b;
  margin-top: 5px;
}

.recommendations-section {
  margin-bottom: 30px;
}

.recommendations-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #0f172a;
  font-size: 1.1em;
}

.no-recommendations {
  background: #f0fdf4;
  color: #166534;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
}

.recommendations-table {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 180px 120px 100px 100px 120px 120px 100px;
  gap: 15px;
  background: #f1f5f9;
  padding: 15px;
  font-weight: 600;
  color: #0f172a;
  border-bottom: 1px solid #cbd5e1;
  position: sticky;
  top: 0;
}

.table-rows {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 180px 120px 100px 100px 120px 120px 100px;
  gap: 15px;
  padding: 15px;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f0f4f8;
}

.col-sku, .col-name, .col-category, .col-demand, .col-quantity, .col-unit-cost, .col-total, .col-lead {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 6px;
  margin-top: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  color: #475569;
}

.summary-row .label {
  font-weight: 600;
  color: #0f172a;
}

.summary-row .value {
  font-weight: 600;
  color: #3b82f6;
}

.action-section {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.place-order-btn {
  padding: 12px 30px;
  font-size: 1em;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.place-order-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
}

.place-order-btn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.success-message {
  background: #dcfce7;
  color: #166534;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  border-left: 4px solid #10b981;
}

@media (max-width: 768px) {
  .budget-container {
    flex-direction: column;
    gap: 15px;
  }

  .budget-display {
    text-align: left;
  }

  .table-header, .table-row {
    grid-template-columns: 80px 140px 100px 80px 80px 100px;
    gap: 10px;
  }

  .col-lead {
    display: none;
  }

  .table-header > :nth-child(8),
  .table-row > :nth-child(8) {
    display: none;
  }
}
</style>
