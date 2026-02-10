<script setup>
const {user} = useAuth()
const {cachedWorkspaces, getAll: fetchWorkspaces} = useWorkspaces()
const route = useRoute()

const items = [
  {
    label: 'Orders',
    icon: 'i-ri-dashboard-fill',
    class: 'py-4 cursor-pointer',
    defaultOpen: true,
    children: [
      {
        label: 'Board',
        class: 'py-4 cursor-pointer'
      },
      {
        label: 'Archive',
        class: 'py-4 cursor-pointer'
      },
    ]
  },
  {
    label: 'Employees',
    icon: 'i-ri-user-2-fill',
    class: 'py-4 cursor-pointer'
  },
  {
    label: 'Customers',
    icon: 'i-ri-user-smile-fill',
    class: 'py-4 cursor-pointer'
  },
  {
    label: 'Services',
    icon: 'i-ri-shopping-cart-fill',
    class: 'py-4 cursor-pointer'
  },
  {
    label: 'Settings',
    icon: 'i-ri-settings-2-fill',
    class: 'py-4 cursor-pointer'
  }
]

const userFullName = computed(() => user.value?.fullName ?? 'Unknown User')

// const {data} = useFetch('/api/workspaces', {
//   immediate: true,
//   lazy: false,
//   server: false
// })

onMounted(async () => {
  await fetchWorkspaces()
})

</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      :defaultSize="20"
      :maxSize="20"
      :minSize="15"
      class="group"
      collapsible
      resizable
      toggle-side="right">
      <template #header="{ collapsed }">
        <div class="flex justify-between items-center w-full gap-2">
          <NuxtLink v-if="!collapsed"
                    class="spinner hover:scale-105 active:scale-100 ease-in-out origin-center transition-all duration-200"
                    to="/overview">
            <img alt="Kander logo" class="h-7 object-fit select-none pointer-events-none rounded-lg"
                 src="/images/kander_192.png">
          </NuxtLink>
          <UDashboardSidebarCollapse class="cursor-pointer" variant="link"/>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :highlight="true"
          :items="items"
          color="primary"
          orientation="vertical"
          variant="link"
        />
      </template>

      <template #footer="{ collapsed }">
        <ClientOnly>
          <div class="flex items-center gap-2 overflow-hidden py-2 select-none w-full">
            <img v-if="user.avatar"
                 :class="user.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0'"
                 :src="user.avatar"
                 alt=""
                 class="block size-9 object-cover rounded-full pointer-events-none"
                 @error="e => {
                   e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png'
                 }">
            <div v-if="!collapsed" class="flex flex-col">
              <span class="text-sm text-ellipsis overflow-hidden">{{ userFullName }}</span>
              <span class="text-xs text-dimmed text-ellipsis overflow-hidden">{{ user.email }}</span>
            </div>
          </div>
          <template #fallback>
            <div class="flex gap-2 items-center w-full select-none">
              <USkeleton class="size-9 min-h-9 min-w-9 rounded-full"/>
              <div class="flex flex-col gap-1 w-full py-2">
                <USkeleton class="h-3 w-2/3 rounded-full"/>
                <USkeleton class="h-3 w-full rounded-full"/>
              </div>
            </div>
          </template>
        </ClientOnly>
      </template>
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar toggle-side="right">
          <template #title>
            <ClientOnly>
              <!--       todo change email to workspace name       -->
              <div class="flex gap-2 items-center">
                <div class="font-semibold text-sm text-highlighted truncate xs:block hidden">{{ user.email }}</div>
                <UPopover v-if="cachedWorkspaces.length > 0" arrow>
                  <UButton class="cursor-pointer text-default/50" color="neutral" icon="i-ri-expand-up-down-line"
                           variant="ghost"/>
                  <template #content>
                    <div class="p-2 max-h-64 overflow-y-auto w-64 flex flex-col gap-2 select-none">
                      <span class="px-2 py-1 text-sm text-dimmed">Workspaces</span>
                      <UButton v-for="ws in cachedWorkspaces" :to="`/workspace/${ws.id}/board`"
                               class="text-sm w-full py-1 flex gap-1" color="neutral"
                               variant="ghost">
                        <span class="line-clamp-1">{{ ws.title }}</span>
                        <span class="text-primary line-clamp-1">{{
                            ws.id === route.params.wsId ? '(current)' : ''
                          }}</span>
                      </UButton>
                    </div>
                  </template>
                </UPopover>
              </div>
              <template #fallback>
                <USkeleton class="xs:h-4 xs:w-48 size-8 xs:rounded-full"/>
              </template>
            </ClientOnly>
          </template>
          <template #right>
            <UColorModeButton class="cursor-pointer" variant="link"/>
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot/>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
