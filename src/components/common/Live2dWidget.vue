<script setup lang="ts">
import { onMounted, onUnmounted, inject, watch } from 'vue'
import { loadOml2d, type Oml2dMethods } from 'oh-my-live2d'

// 获取沉浸模式状态
const immersiveMode = inject<{ value: boolean }>('immersiveMode', { value: false })

let oml2d: Oml2dMethods | null = null

onMounted(() => {
  initLive2d()
})

onUnmounted(() => {
  if (oml2d) {
    // 清理 Live2D 实例
    oml2d.stageSlideOut()
  }
})

// 监听沉浸模式变化
watch(
  () => immersiveMode.value,
  (isImmersive) => {
    if (!oml2d) return
    if (isImmersive) {
      oml2d.stageSlideOut()
    } else {
      oml2d.stageSlideIn()
    }
  }
)

function initLive2d() {
  // @see https://github.com/oh-my-live2d/oh-my-live2d
  oml2d = loadOml2d({
    sayHello: false, // 禁用控制台 banner
    dockedPosition: 'right',
    // 使用稳定的 jsdelivr CDN 模型
    // https://imuncle.github.io/live2d/
    // https://github.com/guansss/pixi-live2d-display
    models: [
      {
        path: 'https://cdn.jsdelivr.net/gh/imuncle/live2d@master/model/22/model.2017.school.json',
        position: [0, 60],
        scale: 0.25,
        stageStyle: {
          height: 360
        }
      }
      // {
      //     // 碧蓝航线 - 支持换装
      //     path: 'https://cdn.jsdelivr.net/gh/imuncle/live2d@master/model/33/model.default.json',
      //     position: [0, 60],
      //     scale: 0.25,
      //     stageStyle: {
      //         height: 360
      //     }
      // },
      // {
      //     // 22娘 - 支持换装
      //     path: 'https://cdn.jsdelivr.net/gh/imuncle/live2d@master/model/Pio/model.json',
      //     position: [0, 60],
      //     scale: 0.5,
      //     stageStyle: {
      //         height: 360
      //     }
      // },
      // {
      //     // 初音未来
      //     path: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',
      //     position: [0, 60],
      //     scale: 0.08,
      //     stageStyle: {
      //         height: 400
      //     }
      // }
    ],
    // 提示语配置
    tips: {
      idleTips: {
        wordTheDay: true
      }
    },
    // 自定义菜单：删除关于
    menus: {
      disable: false,
      items: (defaultItems) => {
        // 过滤掉切换模型和关于
        return defaultItems.filter((item) => item.id !== 'About')
      }
    },
    // 状态栏配置
    statusBar: {
      disable: false
    },
    // 初始状态
    initialStatus: 'active'
  })
}
</script>

<template>
  <div class="live2d-widget"></div>
</template>

<style scoped>
.live2d-widget {
  pointer-events: none;
}
</style>
