<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
    <header class="navbar">
        <div class="navbar-wrapper">
            <div class="navbar-container">
                <!-- Left: Slot for Toggle & Logo -->
                <div class="navbar-title">
                    <slot name="toggle-bar" />

                    <router-link to="/" class="title-link">
                        <span class="logo">📚</span>
                        <span class="text">Lumina</span>
                    </router-link>
                </div>

                <!-- Right: Nav & Actions -->
                <div class="navbar-content">
                    <nav class="navbar-menu hidden md:flex">
                        <router-link to="/guide/intro" class="menu-link" active-class="active">
                            指南
                        </router-link>
                        <router-link to="/games/snake" class="menu-link" active-class="active">
                            贪吃蛇
                        </router-link>
                    </nav>
                    <div class="navbar-actions">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
/* Navbar */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    height: var(--vp-nav-height);
    background-color: rgba(255, 255, 255, 0.82);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--vp-c-divider);
    transition: background-color 0.25s, border-color 0.25s;
}

:global(.dark) .navbar {
    background-color: rgba(27, 27, 31, 0.82);
}

.navbar-wrapper {
    /* max-width: 1400px; Remove max-width for full width feel on docs, match DocLayout preference or DefaultLayout? 
     DefaultLayout had max-width: 1400px. DocLayout removed it.
     Let's keep it fluid (removed) for consistency with docs, or make it a prop? 
     Actually, looking at VitePress, usually it's fluid but constrained content.
     Let's use the DocLayout version (fluid) as it fits both. */
    margin: 0 auto;
    height: 100%;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 24px;
}

.navbar-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.title-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
}

.title-link:hover {
    opacity: 0.8;
}

.navbar-content {
    display: flex;
    align-items: center;
    gap: 24px;
}

.navbar-menu {
    display: flex;
    gap: 24px;
}

.menu-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
    transition: color 0.25s;
}

.menu-link:hover,
.menu-link.active {
    color: var(--vp-c-brand-1);
}

.navbar-actions {
    display: flex;
    align-items: center;
    padding-left: 16px;
    border-left: 1px solid var(--vp-c-divider);
}
</style>
