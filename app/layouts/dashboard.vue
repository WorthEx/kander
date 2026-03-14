<script setup>
const {user, logout} = useAuth()
const route = useRoute()
const toaster = useToast()
const notif = useNotification(toaster)
const wsId = computed(() => route.params.wsId)
const {$kanbanWs} = useNuxtApp()

onMounted(_ => {
  if (wsId.value && import.meta.client) $kanbanWs.connect(wsId.value)
})

const navlinkClass = 'py-4 cursor-pointer gap-4'
const sidebarItems = computed(_ => [
  {
    label: 'Orders',
    icon: 'i-ri-dashboard-fill',
    class: navlinkClass,
    defaultOpen: true,
    to: `/workspace/${wsId.value}/board`,
    children: [
      {
        label: 'Board',
        class: navlinkClass,
        active: route.fullPath.includes('board'),
        to: `/workspace/${wsId.value}/board`
      },
      {
        label: 'Archive',
        class: navlinkClass,
        active: route.fullPath.includes('archive'),
        to: `/workspace/${wsId.value}/archive`
      },
    ],
    active: route.fullPath.includes('board') || route.fullPath.includes('archive')
  },
  {
    label: 'Employees',
    icon: 'i-ri-user-2-fill',
    class: navlinkClass,
    active: route.fullPath.includes('employees'),
    to: `/workspace/${wsId.value}/employees`
  },
  {
    label: 'Customers',
    icon: 'i-ri-user-smile-fill',
    class: navlinkClass,
    active: route.fullPath.includes('customers'),
    to: `/workspace/${wsId.value}/customers`
  },
  {
    label: 'Services',
    icon: 'i-ri-shopping-cart-fill',
    class: navlinkClass,
    active: route.fullPath.includes('services'),
    to: `/workspace/${wsId.value}/services`
  },
  {
    label: 'Integration',
    icon: 'i-ri-code-view',
    class: navlinkClass,
    active: route.fullPath.includes('integration'),
    to: `/workspace/${wsId.value}/integration`,
    disabled: currentWorkspace.value?.workspaceMember?.role !== 'admin' ?? true
  },
  {
    label: 'Settings',
    icon: 'i-ri-settings-2-fill',
    class: navlinkClass,
    active: route.fullPath.includes('settings'),
    to: `/workspace/${wsId.value}/settings`,
    disabled: currentWorkspace.value?.workspaceMember?.role !== 'admin' ?? true
  },
])

const userFullName = computed(() => user.value?.fullName ?? 'Unknown User')

const userEditModalOpened = ref(false)
const workspacesPopoverOpened = ref(false)

const {data: currentWorkspace, pending: loadingWorkspace} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}`, {
  server: false,
  onResponseError: _ => {
    notif.error("Workspace not found!")
    navigateTo('/overview', {replace: true})
  },
  onResponse: res => {
    user.value.role = res.response._data.workspaceMember.role
  },
  key: 'currentWorkspace',
  watch: [wsId]
})

const {data: workspaces, pending: loadingWorkspaces} = await useLazyFetch(_ => `/api/workspaces/`, {
  server: false,
  key: 'workspaces'
})

</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      :defaultSize="12"
      :maxSize="15"
      :minSize="11"
      class="group"
      collapsible
      resizable
      toggle-side="right">
      <template #header="{ collapsed }">
        <div class="flex justify-between items-center w-full gap-2">
          <UTooltip text="To overview">
            <NuxtLink v-if="!collapsed"
                      class="spinner hover:scale-105 active:scale-100 ease-in-out origin-center transition-all duration-200"
                      to="/overview">
              <img alt="Kander logo" class="h-7 object-fit select-none pointer-events-none rounded-lg"
                   src="/images/kander_192.png">
            </NuxtLink>
          </UTooltip>
          <UDashboardSidebarCollapse class="cursor-pointer" variant="link"/>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="sidebarItems"
          class=""
          color="primary"
          highlight
          highlightColor="primary"
          orientation="vertical"
          variant="link"
        />
        <UButton :label="!collapsed ? 'Logout' : ''" class="mt-auto cursor-pointer gap-4 py-4" color="neutral"
                 icon="i-ri-shut-down-line"
                 variant="link"
                 @click="logout"/>
      </template>

      <template #footer="{ collapsed }">
        <ClientOnly>
          <ProfileEditModal v-model:modalOpened="userEditModalOpened">
            <div
              :class="!collapsed && 'px-2 hover:bg-muted'"
              class="cursor-pointer flex items-center gap-2 overflow-hidden py-2 rounded-lg transition-colors select-none w-full"
              @click="_ => userEditModalOpened = true">
              <img v-if="user.avatar"
                   :class="[user.avatar.includes('ssl.gstatic.com/docs/common/profile') && 'light:brightness-0', collapsed ? 'size-8' : 'size-10']"
                   :src="user.avatar"
                   alt=""
                   class="block object-cover rounded-full pointer-events-none"
                   @error="e => {
                   e.target.src='https://ssl.gstatic.com/docs/common/profile/capybara_lg.png'
                 }">
              <div v-if="!collapsed" class="flex flex-col">
                <span class="text-sm text-ellipsis overflow-hidden">{{ userFullName }}</span>
                <span class="text-xs text-dimmed text-ellipsis overflow-hidden">{{ user.email }}</span>
              </div>
            </div>
          </ProfileEditModal>
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
            <div class="flex gap-2 items-center relative w-full">
              <div v-if="!loadingWorkspace && currentWorkspace"
                   class="font-semibold text-sm text-highlighted truncate w-[calc(100%-2rem)]">{{
                  currentWorkspace.workspace.title
                }}
              </div>
              <USkeleton v-else class="h-4 w-48 xs:rounded-full"/>

              <UPopover v-if="workspaces && !loadingWorkspaces" v-model:open="workspacesPopoverOpened" arrow>
                <UButton class="cursor-pointer text-default/50" color="neutral" icon="i-ri-expand-up-down-line"
                         variant="ghost"/>
                <template #content>
                  <div class="p-2 max-h-64 overflow-y-auto w-52 flex flex-col gap-2 select-none">
                    <span class="px-2 py-1 text-sm text-dimmed">Workspaces</span>
                    <UButton v-for="ws in workspaces" :to="{
                      route: route.name, params: { wsId: ws.id }
                    }"
                             class="text-sm w-full py-1 flex gap-4"
                             color="neutral" variant="ghost"
                             @click="workspacesPopoverOpened = false">
                      <span class="line-clamp-1">{{ ws.title }}</span>
                      <div v-if="ws.id === route.params.wsId" class="bg-primary size-1.5 rounded-full"/>
                    </UButton>
                  </div>
                </template>
              </UPopover>
              <USkeleton v-else class="size-8 xs:rounded-lg"/>
            </div>
          </template>
          <template #right>
            <UTooltip text="Switch theme">
              <UColorModeButton class="cursor-pointer" variant="link"/>
            </UTooltip>
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot/>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style scoped>

</style>
