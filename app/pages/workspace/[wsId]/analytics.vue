<script setup>
import NumberFlow from "@number-flow/vue"
import {Line} from "vue-chartjs"

definePageMeta({
  layout: 'dashboard',
})

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const verticalHoverPlugin = {
  id: 'verticalHoverLine',
  afterDraw: (chart) => {
    if (chart.tooltip?._active?.length) {
      const activePoint = chart.tooltip._active[0];
      const {ctx} = chart;
      const {x} = activePoint.element;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(157,148,148,0.5)'
      ctx.stroke();
      ctx.restore();
    }
  }
}

const toaster = useToast()
const notif = useNotification(toaster)
const route = useRoute()
const wsId = computed(() => route.params.wsId)
const {generateAnnualReport} = useReports()
const colorMode = useColorMode()
const {data: currentWorkspace} = useNuxtData('currentWorkspace')

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

const {data: stats} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/analytics/stats`, {
  server: false,
  key: `analyticsStats-${wsId.value}`,
  watch: [wsId],
})

const {data: charts} = await useLazyFetch(_ => `/api/workspaces/${wsId.value}/analytics/charts`, {
  server: false,
  key: `analyticsCharts-${wsId.value}`,
  watch: [wsId],
})

const style = import.meta.client ? getComputedStyle(document.body) : undefined
const primaryColor = computed(_ => {
  const isDark = colorMode.preference === 'dark'
  return style ? style.getPropertyValue('--ui-primary') :
    isDark ? 'rgb(255, 210, 48)' : 'rgb(240, 177, 0)' // hardcoded colors, idk what to do with it
})
const ticksColor = computed(_ => {
  const isDark = colorMode.preference === 'dark'
  return style ? style.getPropertyValue('--ui-text-dimmed') :
    isDark ? 'rgb(255, 210, 48)' : 'rgb(240, 177, 0)'
})
const gridColor = computed(_ => colorMode.preference === 'dark' ? 'rgb(44,44,44)' : 'rgb(222,222,222)')

const monthlyRevenueData = computed(_ => (
  {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: charts.value ? charts.value.monthlyRevenue : Array.from({length: 12}, () => 0),
        borderColor: primaryColor.value,
        tension: 0.3,
        pointRadius: 0,
      },
    ]
  }
))

const monthlyRevenueOptions = computed(_ => (
  {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          color: ticksColor.value,
          callback: (value, _, __) => {
            return value >= 1000 ? (value / 1000) + 'k' : value
          }
        },
        grid: {
          drawTicks: false,
          color: gridColor.value,
        },
        border: {
          dash: [5, 5],
        },
      },
      x: {
        ticks: {
          color: ticksColor.value,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
    },
  }
))

const currency = computed(() => currentWorkspace.value?.workspace?.currency)

const doughnutColors = computed(() => {
  const isDark = colorMode.preference === 'dark'
  return isDark ? ['rgb(255, 210, 48)', 'rgb(255, 184, 106)', 'rgb(94, 233, 181)', 'rgb(83, 234, 253)', 'rgb(196, 180, 255)', 'rgb(115, 115, 115)']
    : ['rgb(254, 154, 0)', 'rgb(255, 105, 0)', 'rgb(0, 188, 125)', 'rgb(0, 184, 219)', 'rgb(142, 81, 255)', 'rgb(115, 115, 115)']
})

const isMobile = computed(_ => {
  if (import.meta.client) return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const doughnutDataComputed = computed(_ => {
  if (!charts.value?.doughnutData) return [
    {
      label: undefined,
      percent: 0,
      revenue: 0
    },
    {
      label: undefined,
      percent: 0,
      revenue: 0
    },
    {
      label: undefined,
      percent: 0,
      revenue: 0
    },
    {
      label: undefined,
      percent: 0,
      revenue: 0
    },
    {
      label: undefined,
      percent: 0,
      revenue: 0
    },
    {
      label: undefined,
      percent: 0,
      revenue: 0
    }
  ]
  return charts.value.doughnutData
})
</script>

<template>
  <DashboardContainer>
    <!--  Report banner  -->
    <div
      class="bg-primary sm:p-6 p-4 text-inverted rounded-xl gap-4 flex sm:flex-row flex-col justify-between sm:items-center items-start relative overflow-hidden select-none">
      <div class="flex flex-col z-1">
        <span class="font-semibold">Preparing financial statement?</span>
        <span class="text-sm">Get a detailed annual report in XLSX format</span>
      </div>
      <UButton class="z-1 cursor-pointer px-4 py-2 rounded-lg max-sm:w-full max-sm:justify-center
                      dark:bg-black dark:hover:bg-black/80 dark:text-white dark:active:bg-primary dark:active:text-black
                      bg-white hover:bg-white/80 text-black active:bg-primary active:text-white
                        peer/action"
               label="Get report"
               @click="getReportSlideoverOpened = true">
        <template #leading>
          <UIcon class="size-5" name="i-ri-file-download-fill"/>
        </template>
      </UButton>
      <div
        class="absolute dark:opacity-70 opacity-80 max-md:size-125 size-300 right-0 translate-x-[50%] top-0 -translate-y-1/2 transition-all ease-out duration-500
        peer-hover/action:scale-125">
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
    <section class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 xs:gap-4 gap-2">
      <AnalyticsStatBlock description="All revenue generated by this organization" icon="i-ri-funds-box-fill"
                          tint="secondary"
                          title="Total Revenue">
        <NumberFlow :format="{ style: 'currency', currency: currency ?? 'USD', trailingZeroDisplay: 'stripIfInteger' }"
                    :locales="'en-US'"
                    :value="stats ? stats.revenue.total : 0"
                    class="xs:text-2xl text-xl font-bold text-highlighted leading-6"/>
        <template #secondary>
          <span v-if="stats" :class="[stats.revenue.growth >= 0 ? 'text-success' : 'text-error']"
                class="inline-flex items-center text-sm max-xs:text-xs font-semibold">
            <UIcon :name="stats.revenue.growth >= 0 ? 'i-ri-arrow-up-line' : 'i-ri-arrow-down-line'"
                   class="size-3.5"/>{{
              stats.revenue.growth ?? 0
            }}%&nbsp;<span class="text-default font-normal">this&nbsp;month</span>
          </span>
          <USkeleton v-else class="w-full h-4 rounded-full"/>
        </template>
      </AnalyticsStatBlock>
      <AnalyticsStatBlock description="All orders of current workspace including archived"
                          icon="i-ri-shopping-basket-fill" tint="tertiary"
                          title="Total Orders">
        <NumberFlow
          :locales="'en-US'"
          :value="stats ? stats.orders.total : 0"
          class="xs:text-2xl text-xl font-bold text-highlighted leading-6"/>
        <template #secondary>
                <span v-if="stats" :class="[stats.orders.thisMonth >= 0 ? 'text-success' : 'text-error']"
                      class="inline-flex items-center text-sm max-xs:text-xs font-semibold">
                  +{{
                    stats.orders.thisMonth ?? 0
                  }}&nbsp;<span class="text-default font-normal">this&nbsp;month</span>
                </span>
          <USkeleton v-else class="w-full h-4 rounded-full"/>
        </template>
      </AnalyticsStatBlock>
      <AnalyticsStatBlock description="All customers ever registered" icon="i-ri-user-5-fill"
                          tint="quaternary"
                          title="All customers">
        <NumberFlow
          :locales="'en-US'"
          :value="stats ? stats.customers.total : 0"
          class="xs:text-2xl text-xl font-bold text-highlighted leading-6"/>
        <template #secondary>
                <span v-if="stats" :class="[stats.customers.newLast30Days >= 0 ? 'text-success' : 'text-error']"
                      class="inline-flex items-center text-sm max-xs:text-xs font-semibold">
                  +{{
                    stats.customers.newLast30Days ?? 0
                  }}&nbsp;<span class="text-default font-normal">this&nbsp;month</span>
                </span>
          <USkeleton v-else class="w-full h-4 rounded-full"/>
        </template>
      </AnalyticsStatBlock>
      <AnalyticsStatBlock :description="`Average order total (${currency})`" icon="i-ri-money-dollar-circle-fill"
                          tint="quinary"
                          title="Average check">
        <NumberFlow :format="{ style: 'currency', currency: currency ?? 'USD', trailingZeroDisplay: 'stripIfInteger' }"
                    :locales="'en-US'"
                    :value="stats ? stats.avgCheck.value : 0"
                    class="xs:text-2xl text-xl font-bold text-highlighted leading-6"/>
        <template #secondary>
            <span v-if="stats"
                  :class="[stats.avgCheck.thisMonthAvgCheck > 0 ? 'text-success' : 'text-error']"
                  class="inline-flex items-center text-sm max-xs:text-xs font-semibold">
              <NumberFlow
                :format="{ style: 'currency', currency: currency ?? 'USD', trailingZeroDisplay: 'stripIfInteger', notation: 'standard' }"
                :locales="'en-US'"
                :value="stats.avgCheck.thisMonthAvgCheck"
                class="text-sm max-xs:text-xs font-semibold"/>&nbsp;<span class="text-default font-normal">this&nbsp;month</span>
            </span>
          <USkeleton v-else class="w-full h-4 rounded-full"/>
        </template>
      </AnalyticsStatBlock>
    </section>
    <section class="flex gap-4 max-xl:flex-col">
      <ClientOnly>
        <div
          class="flex flex-col xl:w-2/3 ring ring-default xs:min-h-64 min-h-48 rounded-xl xs:p-4 p-2 overflow-hidden">
          <div class="max-xs:text-sm max-xs:pt-2 pb-3 px-1 flex justify-between items-center">
            <span class="font-semibold">Monthly Revenue</span>
            <NumberFlow
              :format="{ style: 'currency', currency: currency ?? 'USD', trailingZeroDisplay: 'stripIfInteger' }"
              :locales="'en-US'"
              :value="charts ? charts.annualRevenue : 0"
              class="text-highlighted"/>
          </div>
          <Line :data="monthlyRevenueData" :options="monthlyRevenueOptions" :plugins="[verticalHoverPlugin]"/>
        </div>
        <template #fallback>
          <USkeleton class="lg:w-2/3 xs:min-h-64 min-h-48 rounded-xl"/>
        </template>
      </ClientOnly>
      <ClientOnly>
        <div
          class="flex flex-col xl:justify-between xl:w-1/3 w-full ring ring-default xs:min-h-64 min-h-48 rounded-xl p-4 pb-2 overflow-hidden">
          <div class="max-xs:text-sm flex justify-between items-center">
            <span class="font-semibold">Bestsellers</span>
          </div>
          <div class="flex flex-col justify-between gap-2 pt-2.5 h-full">
            <div v-if="charts?.doughnutData && charts?.doughnutData.length > 0"
                 class="flex gap-1 w-full p-1 ring ring-default rounded-lg bg-muted">
              <UPopover v-for="(d, i) in charts.doughnutData" :mode="isMobile ? 'click' : 'hover'">
                <div :key="i"
                     :style="{width: `${d.percent}%`, backgroundColor: doughnutColors[i]}"
                     class="h-6 rounded-md"/>
                <template #content>
                  <div class="flex flex-col gap-1 text-sm p-2">
                    <span class="font-semibold">{{ d.label }}</span>
                    <span>{{ d.percent }}%</span>
                  </div>
                </template>
              </UPopover>
            </div>
            <div v-else class="grid place-content-center size-full h-full">
              <span class="text-dimmed">Nothing to show</span>
            </div>
            <div class="flex flex-col divide-y divide-default select-none">
              <UPopover v-for="(d, i) in doughnutDataComputed" :mode="isMobile ? 'click' : 'hover'">
                <div class="py-3.5 flex justify-between items-center">
                  <div class="flex gap-2 items-center">
                    <div :style="{backgroundColor: doughnutColors[i]}"
                         class="h-6 min-w-1.5 max-w-1.5 rounded-full"/>
                    <span v-if="d.label" class="text-sm capitalize text-nowrap">{{ d.label }}</span>
                    <USkeleton v-else class="h-3 w-1/2 rounded-full"/>
                  </div>
                  <div class="flex gap-2 items-center">
                    <NumberFlow
                      :value="d.percent"
                      class="font-bold leading-6"
                      suffix="%"/>
                  </div>
                </div>
                <template #content>
                  <div class="flex flex-col gap-1 text-sm p-2">
                    <span class="font-semibold">{{ d.label }}</span>
                    <span>{{ d.percent }}% ({{ currency }} {{ formatPrice(d.revenue) }})</span>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
        <template #fallback>
          <USkeleton class="lg:w-1/3 xs:min-h-64 min-h-48 rounded-xl"/>
        </template>
      </ClientOnly>
    </section>
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
number-flow-vue::part(suffix) {
  margin-left: .0625em;
  color: var(--ui-text-dimmed);
}
</style>
