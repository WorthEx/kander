<script lang="ts" setup>
import {useClipboard} from "@vueuse/core";
import {CurlGenerator} from "curl-generator";


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const props = defineProps<{
  title: string,
  route: string,
  description: string,
  curl: any,
  method: HttpMethod
}>()

const {copy} = useClipboard()
const toaster = useToast()
const notif = useNotification(toaster)
const {apiBaseUrl} = useConstants()

const handleCopyRoute = () => {
  copy(apiBaseUrl.value + props.route)
  notif.info('API route copied to clipboard!')
}

const handleCopyCurlRequest = () => {
  copy(curlRequest.value)
  notif.info('cURL request copied to clipboard!')
}

const methodColor = computed(() => {
  switch (props.method) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'info'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'error'
    case 'PATCH':
      return 'secondary'
  }
})

const curlRequest = computed(() => CurlGenerator(props.curl))

const formatCurlRequest = (curlString: string) => {
  return curlString.replace(/-d '({.*?})'/s, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2);
      return `-d '${formatted}'`
    } catch {
      return match
    }
  })
}
</script>

<template>
  <USlideover :description :title :ui="{description: 'text-pretty', content: 'max-w-lg'}">

    <div
      class="flex max-xs:flex-col overflow-hidden gap-2 justify-between ring ring-default rounded-xl w-full  cursor-pointer p-4 bg-muted/50 hover:bg-muted transition-all">
      <div class="flex gap-2 items-center h-fit">
        <UBadge :color="methodColor" class="h-fit uppercase font-semibold" variant="subtle">{{ method }}</UBadge>
        <span class="text-sm">{{ title }}</span>
      </div>
      <span class="text-sm text-dimmed break-all">
          <span class="hidden  max-xs:inline-block sm:inline-block">{{ apiBaseUrl }}</span><span
        class="text-sm text-muted">{{
          route
        }}</span>
      </span>
    </div>

    <template #body>
      <section class="flex flex-col gap-4">
        <div class="flex flex-col gap-3 rounded-xl ring ring-default p-2">
          <UTooltip text="Copy full route">
            <div
              class="flex items-center gap-3 pe-2 h-fit group cursor-pointer overflow-hidden" @click="handleCopyRoute">
              <UBadge :color="methodColor" class="h-fit uppercase font-semibold" variant="subtle">{{ method }}</UBadge>
              <div
                class="flex max-xs:flex-col select-none break-all *:transition-all text-sm text-muted *:group-hover:text-default">
                <span class="text-dimmed">{{ apiBaseUrl }}</span>
                <span>{{ route }}</span>
              </div>
              <UIcon class="ms-auto size-3.5 group-hover:opacity-100 opacity-0 transition-all text-muted"
                     name="i-ri-file-copy-line"/>
            </div>
          </UTooltip>
          <USeparator/>
          <section class="ps-2 group select-none cursor-pointer" @click="handleCopyCurlRequest">
            <pre class="pb-3 overflow-auto font-mono text-sm">{{ formatCurlRequest(curlRequest) }}</pre>

            <USeparator/>
            <div class="pt-3 pb-1 pe-2 flex justify-between items-center">
              <span class="text-xs text-dimmed group-hover:text-primary transition-all">Don't forget to insert your API key!</span>
              <UIcon
                class="text-muted group-hover:opacity-100 opacity-0 transition-all size-3.5"
                name="i-ri-file-copy-line"/>
            </div>
          </section>
        </div>
      </section>
    </template>

  </USlideover>
</template>
