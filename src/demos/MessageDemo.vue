<template>
  <div class="message-demo">
    <h4>点击按钮测试不同类型的消息</h4>
    <div class="demo-buttons">
      <button class="demo-btn success" @click="showSuccess">成功消息</button>
      <button class="demo-btn info" @click="showInfo">信息消息</button>
      <button class="demo-btn warning" @click="showWarning">警告消息</button>
      <button class="demo-btn error" @click="showError">错误消息</button>
    </div>
    <div class="demo-buttons" style="margin-top: 12px">
      <button class="demo-btn closable" @click="showClosable">可关闭消息</button>
      <button class="demo-btn multi" @click="showMultiple">连续多条</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/composables/ui/useMessage'

const showSuccess = () => message.success('操作成功！')
const showInfo = () => message.info('这是一条提示信息')
const showWarning = () => message.warning('请注意检查输入')
const showError = () => message.error('操作失败，请重试')

const showClosable = () =>
  message.success({
    content: '点击右侧关闭按钮',
    duration: 0,
    closable: true
  })

const showMultiple = () => {
  message.success('第一条消息')
  setTimeout(() => message.info('第二条消息'), 200)
  setTimeout(() => message.warning('第三条消息'), 400)
}
</script>
<style scoped lang="scss">
.message-demo {
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 16px 0;

  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }
}

.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &.success {
    background: #42b883;
    color: white;

    &:hover {
      background: #33a06f;
    }
  }

  &.info {
    background: #388bfd;
    color: white;

    &:hover {
      background: #2d7be8;
    }
  }

  &.warning {
    background: #faad14;
    color: white;

    &:hover {
      background: #d49712;
    }
  }

  &.error {
    background: #ff4d4f;
    color: white;

    &:hover {
      background: #e04446;
    }
  }

  &.closable,
  &.multi {
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    border: 1px solid var(--vp-c-divider);

    &:hover {
      border-color: var(--vp-c-brand-1);
      color: var(--vp-c-brand-1);
    }
  }
}
</style>
