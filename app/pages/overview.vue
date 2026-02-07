<script lang="ts" setup>
const {user} = useAuth()
</script>

<template>
  <UDashboardGroup>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :toggle="false">
          <template #leading>
            <NuxtLink
              class="sm:hover:rotate-360 hover:scale-110 ease-in-out origin-center transition-all duration-500"
              to="/">
              <img alt="Kander logo" class="h-7 object-fit select-none pointer-events-none rounded-lg"
                   src="/images/kander_192.png">
            </NuxtLink>
          </template>
          <template #title>
            <ClientOnly>
              <div class="ms-2 font-semibold text-sm text-highlighted truncate">{{
                  user ? user.email : 'Loading...'
                }}
              </div>
            </ClientOnly>
          </template>
          <template #right>
            <UColorModeButton class="cursor-pointer" variant="link"/>
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <DashboardContainer>
          <DashboardHeader>
            <template #title>
              Workspaces
            </template>
            <template #right>
              <DashboardHeaderButton :action="() => {console.log('something')}" icon="i-ri-add-fill" label="Create"/>
            </template>
          </DashboardHeader>
          <div class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            <!--     todo: workspaces     -->
            workspace
          </div>
        </DashboardContainer>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

