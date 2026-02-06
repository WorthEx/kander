<script setup>
const route = useRoute()
const token = route.query.token
const toast = useToast()
const notif = useNotification(toast)

if (!token) {
  navigateTo('/auth/login')
}

onMounted(async _ => {
  try {
    await $fetch('/api/auth/verify', {
      query: {token},
    })
    navigateTo('/dashboard')
  } catch (_) {
    notif.error(null, 'We couldn\'t verify your token: it\'s either invalid or expired.')
    navigateTo('/auth/login')
  }
})

</script>

<template>
  <div class="absolute w-full h-6/7 grid place-content-center">
    <div class="relative flex flex-col gap-4 p-4 rounded-lg ring ring-default bg-muted/50">
      <div class="w-full">Logging you in...</div>
      <UProgress class="w-48" size="xs"/>
    </div>
  </div>
</template>
