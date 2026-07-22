<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <SidebarNav
      :appName="t('nav.companyName')"
      :navItems="navItems"
      @toggle="handleSidebarToggle"
    />

    <main class="main-wrapper">
      <!-- Top bar for filters and actions -->
      <header class="top-bar">
        <div class="top-bar-content">
          <FilterBar />
          <div class="header-actions">
            <LanguageSwitcher />
            <ProfileMenu
              @show-profile-details="showProfileDetails = true"
              @show-tasks="showTasks = true"
            />
          </div>
        </div>
      </header>

      <!-- Main content area -->
      <div class="content-area">
        <router-view />
      </div>
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import SidebarNav from './components/SidebarNav.vue'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    SidebarNav,
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])
    const sidebarCollapsed = ref(false)

    const navItems = [
      { path: '/', label: t('nav.overview'), icon: '📊' },
      { path: '/inventory', label: t('nav.inventory'), icon: '📦' },
      { path: '/orders', label: t('nav.orders'), icon: '🛒' },
      { path: '/spending', label: t('nav.finance'), icon: '💰' },
      { path: '/demand', label: t('nav.demandForecast'), icon: '📈' },
      { path: '/restocking', label: t('nav.restocking'), icon: '🔄' },
      { path: '/reports', label: 'Reports', icon: '📋' }
    ]

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const handleSidebarToggle = (collapsed) => {
      sidebarCollapsed.value = collapsed
    }

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      navItems,
      sidebarCollapsed,
      handleSidebarToggle,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
@import './styles/tokens.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  transition: margin-left 0.3s ease;
  margin-left: var(--sidebar-width);
}

.app-container.sidebar-collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.top-bar {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  flex-shrink: 0;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-primary);
}

.page-header {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--color-text-secondary);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-md);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: #ea580c;
}

.stat-card.success .stat-value {
  color: #059669;
}

.stat-card.danger .stat-value {
  color: #dc2626;
}

.stat-card.info .stat-value {
  color: #2563eb;
}

.card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
  margin: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

th {
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--color-bg-tertiary);
}

.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: #d1fae5;
  color: var(--color-success);
}

.badge.warning {
  background: #fed7aa;
  color: var(--color-warning);
}

.badge.danger {
  background: #fecaca;
  color: var(--color-danger);
}

.badge.info {
  background: var(--color-accent-light);
  color: var(--color-accent-primary);
}

.badge.submitted {
  background: var(--color-accent-light);
  color: var(--color-accent-primary);
}

.badge.increasing {
  background: #d1fae5;
  color: var(--color-success);
}

.badge.decreasing {
  background: #fecaca;
  color: var(--color-danger);
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: #fecaca;
  color: var(--color-danger);
}

.badge.medium {
  background: #fed7aa;
  color: var(--color-warning);
}

.badge.low {
  background: var(--color-accent-light);
  color: var(--color-accent-primary);
}

.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-tertiary);
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--color-danger);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
  font-size: 0.938rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .app-container,
  .app-container.sidebar-collapsed {
    margin-left: 0;
    flex-direction: column;
  }

  .top-bar {
    border-bottom: 1px solid var(--color-border-light);
  }

  .content-area {
    flex: 1;
  }

  .stats-grid {
    margin: var(--spacing-md);
  }

  .card {
    margin: var(--spacing-md);
  }

  .page-header {
    padding: var(--spacing-md);
  }
}
</style>
