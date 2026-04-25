<script setup>
import {useReports} from "~/composables/useReports.js";

definePageMeta({
  layout: 'dashboard',
})

const toaster = useToast()
const notif = useNotification(toaster)
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const {generateAnnualReport} = useReports()

const getReportSlideoverOpened = ref(false)

const loadingReport = ref(false)

const reportYear = ref(new Date().getFullYear())

const handleGetAnnualReport = async _ => {
  if (!reportYear.value || reportYear.value > 99999) return
  loadingReport.value = true
  try {
    await generateAnnualReport(wsId.value, reportYear.value)
  } catch {
    notif.error("Couldn't generate report. Try again later.")
  } finally {
    loadingReport.value = false
  }
}
</script>

<template>
  <DashboardContainer>
    <!--  Report banner  -->
    <div
      class="bg-primary sm:p-6 p-4 text-inverted rounded-xl gap-4 flex sm:flex-row flex-col justify-between sm:items-center items-start relative overflow-hidden">
      <div class="flex flex-col z-1">
        <span class="font-semibold">Preparing financial statement?</span>
        <span class="text-sm">Get a detailed annual report in XLSX format</span>
      </div>
      <UButton class="z-1 cursor-pointer px-4 py-2 rounded-lg max-sm:w-full max-sm:justify-center
                      dark:bg-black dark:hover:bg-black/80 dark:text-white dark:active:bg-primary dark:active:text-black
                      bg-white hover:bg-white/80 text-black active:bg-primary active:text-white"
               label="Get report"
               @click="getReportSlideoverOpened = true">
        <template #leading>
          <UIcon class="size-5" name="i-ri-file-download-fill"/>
        </template>
      </UButton>
      <div
        class="absolute max-md:opacity-80 opacity-80 max-md:size-125 size-300 right-0 translate-x-[50%] top-0 -translate-y-1/2 transition-all ease-in-out duration-900">
        <svg version="1.1" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="cccircular-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"></stop>
              <stop offset="50%" stop-color="hsl(0, 0%, 100%)" stop-opacity="0"></stop>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.5"></stop>
            </radialGradient>
          </defs>
          <g fill="url(#cccircular-grad)">
            <circle cx="400" cy="400" opacity="0.05" r="427.5"></circle>
            <circle cx="400" cy="400" opacity="0.12" r="399"></circle>
            <circle cx="400" cy="400" opacity="0.19" r="370.5"></circle>
            <circle cx="400" cy="400" opacity="0.25" r="342"></circle>
            <circle cx="400" cy="400" opacity="0.32" r="313.5"></circle>
            <circle cx="400" cy="400" opacity="0.39" r="285"></circle>
            <circle cx="400" cy="400" opacity="0.46" r="256.5"></circle>
            <circle cx="400" cy="400" opacity="0.53" r="228"></circle>
            <circle cx="400" cy="400" opacity="0.59" r="199.5"></circle>
            <circle cx="400" cy="400" opacity="0.66" r="171"></circle>
            <circle cx="400" cy="400" opacity="0.73" r="142.5"></circle>
            <circle cx="400" cy="400" opacity="0.80" r="114"></circle>
            <circle cx="400" cy="400" opacity="0.86" r="85.5"></circle>
            <circle cx="400" cy="400" opacity="0.93" r="57"></circle>
          </g>
        </svg>
      </div>
    </div>
  </DashboardContainer>
  <USlideover v-model:open="getReportSlideoverOpened"
              :title="reportYear ? `Download annual report for ${reportYear}` : 'Download annual report'">
    <template #body>
      <UFormField label="Year" name="reportYear">
        <UInputNumber v-model="reportYear" :formatOptions="{useGrouping: false}" :max="99999" :min="1488"
                      class="w-full [&>input]:rounded-xl [&>input]:px-2 [&>input]:py-2"
                      inputmode="numeric"/>
      </UFormField>
    </template>
    <template #footer="{close}">
      <div
        class="flex mt-4 justify-end w-full max-sm:*:w-full gap-2 *:cursor-pointer *:select-none *:justify-center">
        <UButton class="rounded-xl px-4 py-2" color="neutral" label="Cancel" variant="outline" @click="close"/>
        <UButton :loading="loadingReport" class="rounded-xl px-6 py-2"
                 label="Download" @click="handleGetAnnualReport"/>
      </div>
    </template>
  </USlideover>
</template>

<style scoped>

</style>
