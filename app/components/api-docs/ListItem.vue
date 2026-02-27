<script lang="ts" setup>
import {useClipboard} from "@vueuse/core";
import {CurlGenerator} from "curl-generator";

const props = defineProps<{
  title: string,
  route: string,
  description: string,
  curl: any,
  bodySchema: any,
  pathParams: any,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  status: 'ready' | 'tbd'
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
      class="flex max-xs:flex-col overflow-hidden gap-2 justify-between ring ring-default rounded-xl cursor-pointer w-full p-4 bg-muted/50 hover:bg-muted transition-all">
      <div class="flex gap-3 items-center h-fit">
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
      <div class="flex flex-col gap-4">
        <UAlert v-if="status !== 'ready'" class="select-none" color="warning"
                icon="i-ri-error-warning-fill"
                title="This endpoint is under development and isn't ready for production!"
                variant="solid"/>

        <section class="flex flex-col gap-3 rounded-xl ring ring-default p-2">
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
          <div class="group/curl cursor-pointer" @click="handleCopyCurlRequest">
            <div class="ps-2 select-none">
              <pre class="pb-3 overflow-auto font-mono text-sm">{{ formatCurlRequest(curlRequest) }}</pre>
            </div>
            <USeparator/>
            <div class="pt-3 pb-1 pe-2 flex justify-between items-center">
              <span class="text-xs text-dimmed group-hover/curl:text-primary transition-all">Don't forget to insert your API key!</span>
              <UIcon
                class="text-muted group-hover/curl:opacity-100 opacity-0 transition-all size-3.5"
                name="i-ri-file-copy-line"/>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-3 rounded-xl ring ring-default px-3 py-2 select-none">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold py-1">Headers</span>
            <USeparator/>
            <div class="text-sm flex flex-col gap-3 text-nowrap">
              <div class="flex gap-2 justify-between">
                <span class="">X-API-KEY</span>
                <USeparator/>
                <div class="flex gap-1 *:rounded-lg *:px-2 *:py-0.5 *:bg-elevated *:dark:bg-muted">
                  <span
                    class="text-primary rounded-lg px-2 py-0.5 bg-elevated dark:bg-muted">[YOUR API KEY]</span>
                </div>
              </div>
              <div class="flex gap-2 justify-between">
                <span>Content-type</span>
                <USeparator/>
                <div class="flex gap-1 *:rounded-lg *:px-2 *:py-0.5 *:bg-elevated *:dark:bg-muted">
                  <span class="text-primary rounded-lg px-2 py-0.5 bg-elevated dark:bg-muted select-text">application/json</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-3 rounded-xl ring ring-default px-3 py-2 select-none">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold py-1">Body</span>
            <USeparator/>
            <div v-if="bodySchema" class="text-sm flex flex-col gap-3">
              <div v-for="parameter in Object.entries(bodySchema)" class="flex gap-2 justify-between">
                <span class="">{{ parameter[0].replace('?', '') }}</span>
                <USeparator/>
                <div class="flex gap-1 *:rounded-lg *:px-2 *:py-0.5 *:bg-elevated *:dark:bg-muted">
                  <span v-if="!(parameter[0] as string).includes('?')" class="text-primary">Required</span>
                  <span v-if="typeof parameter[1] === 'string'" class="text-muted">{{ parameter[1] }}</span>
                  <UModal v-else :title="`${parameter[0].replace('?', '')} schema`">
                    <span class="text-muted cursor-pointer">{{
                        JSON.stringify(parameter[1])[0] === '[' ? 'Array' : 'Object'
                      }}</span>
                    <template #body>
                      <pre>{{ parameter[1] }}</pre>
                    </template>
                  </UModal>
                </div>
              </div>
            </div>
            <span v-else class="text-sm text-dimmed py-1">Not required</span>
          </div>
        </section>

        <section class="flex flex-col gap-3 rounded-xl ring ring-default px-3 py-2 select-none">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold py-1">Path parameters</span>
            <USeparator/>
            <div v-if="pathParams" class="text-sm flex flex-col gap-3">
              <div v-for="parameter in Object.entries(pathParams)" class="flex gap-2 justify-between">
                <span class="">{{ parameter[0].replace('?', '') }}</span>
                <USeparator/>
                <div class="flex gap-1 *:rounded-lg *:px-2 *:py-0.5 *:bg-elevated *:dark:bg-muted">
                  <span v-if="!(parameter[0] as string).includes('?')" class="text-primary">Required</span>
                  <span class="text-muted">{{ parameter[1] }}</span>
                </div>
              </div>
            </div>
            <span v-else class="text-sm text-dimmed py-1">Not required</span>
          </div>
        </section>
      </div>
    </template>

  </USlideover>
</template>
