---
title: Obsidian Syntax Support Demo
date: 2025-12-22
tags: [demo, markdown, obsidian]
---

# Obsidian Syntax Support Demo

This page demonstrates the support for generic Obsidian markdown syntax.

## 双向链接 (Wikilinks)

支持使用 `[[内部链接]]` 的语法进行页面跳转。

- **跳转到首页**: [[/|回到首页]]
- **跳转到游戏页**: [[/games|前往游戏中心]]
- **跳转到文档**: [[/docs/guide/intro|阅读使用指南]]
- **带自定义文本**: [[/docs/guide/config|查看配置文档]]

## Image Embeds

Support for `![[image]]` syntax.

- Image: ![[https://obsidian.md/images/obsidian-logo-gradient.png]]

## Highlights

Support for `==highlighted text==` syntax.

This is ==highlighted text== using Obsidian syntax.

## Comments

Support for `%% comment %%`.

This text has a hidden comment: %% You cannot see this %%

## Callouts (Advanced)

Support for standard and foldable callouts with custom titles.

> [!INFO] Standard Callout
> This is a standard callout.

> [!WARNING]+ Foldable (Open)
> This callout defaults to **open**.
>
> It has multiple lines.

> [!NOTE]- Foldable (Collapsed)
> This callout defaults to **collapsed**.
>
> Click to expand.

> [!TIP] Custom Title
> It works!

> [!DANGER]
> No title provided.
