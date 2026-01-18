<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useTags } from '@/composables/article/useTags'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const props = defineProps<{
  cloud?: boolean
}>()

const route = useRoute()
const currentTags = computed(() => {
  return (route.meta.tags as string[]) || []
})

// Word Cloud Mode Logic
const { tags: allTags, getAllTags } = useTags()
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value || !allTags.value.length) return

  chartInstance = echarts.init(chartRef.value)

  const data = allTags.value.map((t) => ({
    name: t.name,
    value: t.count
  }))

  const option = {
    tooltip: {
      show: true
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            // Random color
            return (
              'rgb(' +
              [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') +
              ')'
            )
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333'
          }
        },
        data: data
      }
    ]
  }

  chartInstance.setOption(option)

  chartInstance.on('click', (params: any) => {
    // Navigate to tag page if needed, but current setup uses ?tag= param
    // We can't easily use router-link here, so we might need programmatic navigation
    // But since the usage of this cloud is likely on the /tags page itself, we might filter the list below?
    // For now, let's just emit or log. The user didn't specify interaction for the cloud itself.
    // Actually, usually clicking a tag in the cloud filters/navigates.
    // Assuming /tags path.
    window.location.href = `/tags?tag=${encodeURIComponent(params.name)}`
  })

  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

onMounted(() => {
  if (props.cloud) {
    getAllTags()
    nextTick(() => {
      initChart()
    })
  }
})

watch(
  () => props.cloud,
  (newVal) => {
    if (newVal) {
      getAllTags()
      nextTick(() => {
        initChart()
      })
    }
  }
)
</script>

<template>
  <div class="article-tags-wrapper">
    <!-- Single Article Logic -->
    <div class="article-tags" v-if="!cloud && currentTags.length > 0">
      <div class="tags-container">
        <router-link
          v-for="tag in currentTags"
          :key="tag"
          :to="`/tags?tag=${tag}`"
          class="tag-item"
        >
          #{{ tag }}
        </router-link>
      </div>
    </div>

    <!-- Cloud Mode -->
    <div v-else-if="cloud" class="tags-cloud-container">
      <div ref="chartRef" class="word-cloud-chart"></div>

      <div class="cloud-list-container">
        <router-link
          v-for="tag in allTags"
          :key="tag.name"
          :to="`/tags?tag=${tag.name}`"
          class="cloud-tag-item"
        >
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">{{ tag.count }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-tags {
  /* Margins handled by parent layout */
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s;
}

.tag-item:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

/* Cloud Mode Styles */
.tags-cloud-container {
  width: 100%;
}

.word-cloud-chart {
  width: 100%;
  height: 300px;
  /* Adjust as needed */
  margin-bottom: 32px;
}

.cloud-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.cloud-tag-item {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 99px;
  /* Pill shape */
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cloud-tag-item:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tag-name {
  margin-right: 8px;
  font-weight: 500;
}

.tag-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  background-color: var(--vp-c-bg-alt);
  padding: 2px 6px;
  border-radius: 12px;
}

.cloud-tag-item:hover .tag-count {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}
</style>
