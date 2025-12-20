import { ref } from 'vue'

export function useSidebar() {
    const isOpen = ref(true)

    const toggleSidebar = () => {
        isOpen.value = !isOpen.value
    }

    const closeSidebar = () => {
        isOpen.value = false
    }

    const openSidebar = () => {
        isOpen.value = true
    }

    return {
        isOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar
    }
}
