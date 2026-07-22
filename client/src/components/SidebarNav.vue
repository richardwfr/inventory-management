<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div v-if="!isCollapsed" class="logo-text">
          <h2>{{ appName }}</h2>
        </div>
        <button class="toggle-btn" @click="toggleSidebar" :title="isCollapsed ? 'Expand' : 'Collapse'">
          <span class="toggle-icon">☰</span>
        </button>
      </div>
    </div>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
        :title="isCollapsed ? item.label : ''"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer Actions -->
    <div class="sidebar-footer">
      <button class="sidebar-action" :title="isCollapsed ? 'Settings' : ''">
        <span>⚙️</span>
        <span v-if="!isCollapsed">Settings</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'SidebarNav',
  props: {
    appName: {
      type: String,
      default: 'Catalyst'
    },
    navItems: {
      type: Array,
      required: true
    }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const route = useRoute()
    const isCollapsed = ref(false)

    onMounted(() => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        isCollapsed.value = true
      }

      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      isCollapsed.value = isMobile
    }

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      emit('toggle', isCollapsed.value)
    }

    const isActive = (path) => {
      return route.path === path || (path !== '/' && route.path.startsWith(path))
    }

    return {
      isCollapsed,
      toggleSidebar,
      isActive
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: var(--shadow-sm);
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.logo-text h2 {
  margin: 0;
  font-size: 1.2em;
  color: var(--color-text-primary);
  font-weight: 700;
  letter-spacing: -0.5px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-size: 1em;
  padding: 0;
}

.toggle-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.toggle-icon {
  font-size: 1.2em;
  line-height: 1;
  display: block;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin: 0 var(--spacing-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  font-size: 0.95em;
}

.nav-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent-primary);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.nav-icon {
  font-size: 1.25em;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
  line-height: 1;
}

.nav-label {
  white-space: nowrap;
  flex: 1;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.sidebar-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95em;
  font-family: inherit;
}

.sidebar-action:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sidebar {
    width: var(--sidebar-width-collapsed);
  }

  .sidebar:not(.collapsed) {
    width: var(--sidebar-width);
    box-shadow: var(--shadow-lg);
    z-index: 200;
  }
}
</style>
