---
title: 文件预览示例
description: 演示如何在文档中嵌入和预览 Office 文件及电子书
tags:
  - 功能演示
  - Office
  - EPUB
---

# 文件预览

本文档演示如何在 Markdown 中嵌入 Office 文件（Word、Excel、PowerPoint、PDF）和电子书（EPUB）。

## 使用方法

只需在 Markdown 中使用标准链接语法，指向相应文件即可：

```markdown
[文件名](path/to/file.docx)
[报表](path/to/file.xlsx)
[演示文稿](path/to/file.pptx)
[PDF文档](path/to/file.pdf)
[电子书](path/to/file.epub)
```

## 示例预览卡片

以下是各种类型的文件卡片示例：

### Word 文档

[项目需求文档.docx](/files/Word测试.docx)

### Excel 表格

[财务报表.xlsx](/files/Excel测试.xlsx)

### PowerPoint 演示

[产品介绍.pptx](/files/PPT测试.pptx)

### PDF 文档

[用户手册.pdf](/files/PDF测试.pdf)

### EPUB 电子书

[示例电子书.epub](/files/EPUB测试.epub)

## 注意事项

1. 将文件放置在 `public/files/` 目录下
2. 使用绝对路径（以 `/` 开头）或相对路径引用文件
3. 点击卡片即可打开全屏预览
4. 预览模态框支持下载功能

## 支持的文件格式

| 格式       | 扩展名          | 预览方式 |
| ---------- | --------------- | -------- |
| Word       | `.docx`, `.doc` | 在线渲染 |
| Excel      | `.xlsx`, `.xls` | 在线渲染 |
| PowerPoint | `.pptx`, `.ppt` | 在线渲染 |
| PDF        | `.pdf`          | 在线渲染 |
| EPUB       | `.epub`         | 在线渲染 |
