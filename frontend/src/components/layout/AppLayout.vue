<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Users,
  Building2,
  Monitor,
  Key,
  Settings,
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)
const expandedMenus = ref<string[]>(['system']) // 기본으로 시스템 관리 열림

interface MenuItem {
  name: string
  icon?: any
  path?: string
  children?: MenuItem[]
  key?: string
}

const menuItems: MenuItem[] = [
  {
    name: '대시보드',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    name: '사용자 관리',
    icon: Users,
    path: '/user',
  },
  {
    name: '부서 관리',
    icon: Building2,
    path: '/department',
  },
  {
    name: '자산 관리',
    icon: Monitor,
    key: 'asset',
    children: [
      { name: '자산 목록', path: '/asset' },
    ],
  },
  {
    name: '라이센스 관리',
    icon: Key,
    key: 'license',
    children: [
      { name: '라이센스 목록', path: '/license' },
    ],
  },
  {
    name: '시스템 관리',
    icon: Settings,
    key: 'system',
    children: [
      { name: '메뉴 관리', path: '/system/menu' },
      {
        name: '권한 관리',
        key: 'permission',
        children: [
          { name: '권한 목록', path: '/system/role' },
          { name: '메뉴별 권한', path: '/system/role-menu' },
          { name: '사용자별 권한', path: '/system/user-role' },
        ]
      },
    ],
  },
]

const isActive = (path?: string) => {
  if (!path) return false
  return route.path === path
}

const isParentActive = (item: MenuItem): boolean => {
  if (item.path) return isActive(item.path)
  if (item.children) {
    return item.children.some(child => {
      if (child.path) return isActive(child.path)
      if (child.children) return isParentActive(child)
      return false
    })
  }
  return false
}

const toggleMenu = (key: string) => {
  const index = expandedMenus.value.indexOf(key)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(key)
  }
}

const isExpanded = (key?: string) => {
  return key ? expandedMenus.value.includes(key) : false
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white border-r transition-all duration-300 flex flex-col shadow-sm',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b bg-primary">
        <h1 v-if="sidebarOpen" class="text-lg font-bold text-primary-foreground">
          자산관리시스템
        </h1>
        <Button variant="ghost" size="icon" @click="toggleSidebar" class="text-primary-foreground hover:bg-primary-foreground/10">
          <MenuIcon v-if="!sidebarOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </Button>
      </div>

      <!-- Navigation -->
      <ScrollArea class="flex-1 py-4">
        <nav class="px-3 space-y-1">
          <template v-for="item in menuItems" :key="item.name">
            <!-- 하위 메뉴가 없는 경우 -->
            <button
              v-if="!item.children"
              @click="item.path && router.push(item.path)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-gray-100 text-gray-700',
                !sidebarOpen && 'justify-center'
              ]"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
              <span v-if="sidebarOpen" class="font-medium text-sm">{{ item.name }}</span>
            </button>

            <!-- 하위 메뉴가 있는 경우 (1depth) -->
            <div v-else>
              <button
                @click="sidebarOpen ? toggleMenu(item.key!) : null"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isParentActive(item)
                    ? 'bg-gray-100 text-gray-900'
                    : 'hover:bg-gray-50 text-gray-700',
                  !sidebarOpen && 'justify-center'
                ]"
              >
                <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
                <span v-if="sidebarOpen" class="font-medium text-sm flex-1 text-left">
                  {{ item.name }}
                </span>
                <ChevronDown
                  v-if="sidebarOpen && isExpanded(item.key)"
                  class="h-4 w-4 flex-shrink-0 transition-transform"
                />
                <ChevronRight
                  v-if="sidebarOpen && !isExpanded(item.key)"
                  class="h-4 w-4 flex-shrink-0 transition-transform"
                />
              </button>

              <!-- 1depth 하위 메뉴 -->
              <div
                v-if="sidebarOpen && isExpanded(item.key)"
                class="mt-1 space-y-1"
              >
                <template v-for="child in item.children" :key="child.name">
                  <!-- 2depth 하위 메뉴가 없는 경우 -->
                  <button
                    v-if="!child.children"
                    @click="child.path && router.push(child.path)"
                    :class="[
                      'w-full flex items-center pl-11 pr-3 py-2 rounded-lg text-sm transition-all',
                      isActive(child.path)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ child.name }}
                  </button>

                  <!-- 2depth 하위 메뉴가 있는 경우 (권한 관리) -->
                  <div v-else>
                    <button
                      @click="toggleMenu(child.key!)"
                      :class="[
                        'w-full flex items-center pl-11 pr-3 py-2 rounded-lg text-sm transition-all',
                        isParentActive(child)
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'hover:bg-gray-50 text-gray-600'
                      ]"
                    >
                      <span class="flex-1 text-left">{{ child.name }}</span>
                      <ChevronDown
                        v-if="isExpanded(child.key)"
                        class="h-3 w-3 flex-shrink-0"
                      />
                      <ChevronRight
                        v-else
                        class="h-3 w-3 flex-shrink-0"
                      />
                    </button>

                    <!-- 3depth 하위 메뉴 -->
                    <div
                      v-if="isExpanded(child.key)"
                      class="mt-1 space-y-1"
                    >
                      <button
                        v-for="grandchild in child.children"
                        :key="grandchild.path"
                        @click="grandchild.path && router.push(grandchild.path)"
                        :class="[
                          'w-full flex items-center pl-16 pr-3 py-2 rounded-lg text-sm transition-all',
                          isActive(grandchild.path)
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ grandchild.name }}
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </nav>
      </ScrollArea>

      <!-- User Info & Logout -->
      <div class="border-t p-4 bg-gray-50">
        <div v-if="sidebarOpen" class="mb-3">
          <p class="text-sm font-semibold text-gray-900">관리자</p>
          <p class="text-xs text-gray-500">admin@company.com</p>
        </div>
        <Button
          variant="outline"
          :class="[
            'w-full',
            !sidebarOpen && 'px-2'
          ]"
          @click="handleLogout"
        >
          <LogOut class="h-4 w-4" :class="{ 'mr-2': sidebarOpen }" />
          <span v-if="sidebarOpen">로그아웃</span>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b flex items-center px-6 shadow-sm">
        <div class="flex-1">
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ route.meta.title || '페이지' }}
          </h2>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
