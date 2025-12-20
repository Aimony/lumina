<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="hero-section">
        <div class="container">
            <div class="main">
                <h1 class="name">
                    <span class="clip">Lumina</span>
                </h1>
                <p class="text">Personal Knowledge Base System</p>
                <p class="tagline">好记性不如烂笔头，构建个人的技术护城河</p>

                <div class="actions">
                    <div class="action">
                        <RouterLink to="/guide/intro" class="VPButton brand">
                            快速开始
                        </RouterLink>
                    </div>
                    <div class="action">
                        <a href="https://github.com" target="_blank" rel="noreferrer" class="VPButton alt">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </div>
            <div class="image-bg">
                <div class="image-container">
                    <div class="avatar-circle">
                        <span class="avatar-text">L</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Hero Section */
.hero-section {
    padding: calc(var(--vp-nav-height) + 48px) 24px 48px;
}

@media (min-width: 640px) {
    .hero-section {
        padding: calc(var(--vp-nav-height) + 80px) 48px 64px;
    }
}

@media (min-width: 960px) {
    .hero-section {
        padding: calc(var(--vp-nav-height) + 80px) 64px 64px;
    }
}

.container {
    max-width: 1152px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

@media (min-width: 960px) {
    .container {
        flex-direction: row;
        align-items: center;
    }
}

.main {
    position: relative;
    z-index: 10;
    order: 2;
    text-align: center;
}

@media (min-width: 960px) {
    .main {
        order: 1;
        width: calc(100% - 320px);
        text-align: left;
    }
}

.name {
    line-height: 1;
    font-size: 32px;
    font-weight: 700;
    white-space: pre-wrap;
}

.clip {
    background: -webkit-linear-gradient(315deg, var(--vp-c-brand-1) 25%, var(--vp-c-brand-2));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@media (min-width: 640px) {
    .name {
        font-size: 48px;
    }
}

@media (min-width: 960px) {
    .name {
        font-size: 56px;
    }
}

.text {
    padding-top: 8px;
    line-height: 1.5;
    font-size: 32px;
    font-weight: 700;
    color: var(--vp-c-text-1);
}

@media (min-width: 640px) {
    .text {
        font-size: 48px;
    }
}

@media (min-width: 960px) {
    .text {
        font-size: 56px;
    }
}

.tagline {
    padding-top: 24px;
    line-height: 1.6;
    font-size: 18px;
    color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
    .tagline {
        font-size: 20px;
        font-weight: 500;
    }
}

@media (min-width: 960px) {
    .tagline {
        font-size: 24px;
    }
}

.actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: -6px;
    padding-top: 32px;
}

@media (min-width: 960px) {
    .actions {
        justify-content: flex-start;
    }
}

.action {
    padding: 6px;
}

.VPButton {
    display: inline-block;
    border: 1px solid transparent;
    text-align: center;
    font-weight: 600;
    white-space: nowrap;
    transition: color 0.25s, border-color 0.25s, background-color 0.25s;
    border-radius: 20px;
    padding: 0 20px;
    line-height: 38px;
    font-size: 14px;
}

.VPButton.brand {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-bg);
    background-color: var(--vp-c-brand-1);
}

.VPButton.brand:hover {
    border-color: var(--vp-c-brand-2);
    background-color: var(--vp-c-brand-2);
}

.VPButton.alt {
    border-color: var(--vp-c-divider);
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg-alt);
}

.VPButton.alt:hover {
    border-color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg);
}

.image-bg {
    order: 1;
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
}

@media (min-width: 960px) {
    .image-bg {
        order: 2;
        margin-bottom: 0;
        width: 320px;
        height: 320px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.avatar-circle {
    width: 192px;
    height: 192px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    font-weight: bold;
    color: white;
    box-shadow: var(--vp-shadow-3);
    position: relative;
}

.avatar-circle::after {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: var(--vp-c-brand-1);
    opacity: 0.15;
    filter: blur(40px);
    z-index: -1;
    border-radius: 50%;
}
</style>
