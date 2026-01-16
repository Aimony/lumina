/**
 * 极客风控制台 Banner 输出
 */

const LOGO = `
    ██╗     ██╗   ██╗███╗   ███╗██╗███╗   ██╗ █████╗ 
    ██║     ██║   ██║████╗ ████║██║████╗  ██║██╔══██╗
    ██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║███████║
    ██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██╔══██║
    ███████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██║  ██║
    ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝`

const STYLES = {
  logo: 'color: #6366f1; font-size: 14px; font-weight: bold; font-family: monospace;',
  title: 'color: #a855f7; font-size: 16px; font-weight: bold;',
  tech: 'color: #4ade80; font-size: 16px; font-weight: bold;',
  badgeLabel:
    'background: #555; color: #fff; padding: 2px 6px; border-radius: 3px 0 0 3px; font-size: 11px;',
  badgeVersion:
    'background: #4ade80; color: #000; padding: 2px 6px; border-radius: 0 3px 3px 0; font-size: 11px; font-weight: bold;',
  badgeAuthor:
    'background: #6366f1; color: #fff; padding: 2px 6px; border-radius: 0 3px 3px 0; font-size: 11px; font-weight: bold;',
  badgeLicense:
    'background: #f472b6; color: #000; padding: 2px 6px; border-radius: 0 3px 3px 0; font-size: 11px; font-weight: bold;',
  badgeGithub:
    'background: #22d3ee; color: #000; padding: 2px 6px; border-radius: 0 3px 3px 0; font-size: 11px; font-weight: bold;'
}

const TECH_STACK = {
  Framework: { Tech: 'Vue 3.5', Description: 'Progressive JavaScript Framework' },
  Language: { Tech: 'TypeScript', Description: 'Typed JavaScript' },
  'Build Tool': { Tech: 'Vite 7', Description: 'Next Generation Frontend Tooling' },
  State: { Tech: 'Pinia', Description: 'Vue Store' },
  Styling: { Tech: 'TailwindCSS 4', Description: 'Utility-First CSS Framework' },
  Syntax: { Tech: 'Shiki', Description: 'Code Syntax Highlighting' },
  Math: { Tech: 'KaTeX', Description: 'LaTeX Math Rendering' }
}

export function printConsoleBanner() {
  console.log(`%c${LOGO}`, STYLES.logo)
  console.log('%c✨ Personal Knowledge Base System', STYLES.title)

  // 项目信息徽标
  console.log('%cVersion%c 0.1.0', STYLES.badgeLabel, STYLES.badgeVersion)
  console.log('%cAuthor%c Aimony', STYLES.badgeLabel, STYLES.badgeAuthor)
  console.log('%cLicense%c MIT', STYLES.badgeLabel, STYLES.badgeLicense)
  console.log(
    '%cGitHub%c',
    STYLES.badgeLabel,
    STYLES.badgeGithub,
    'https://github.com/Aimony/lumina'
  )

  // 技术栈表格
  console.log('')
  console.log('%c🛠️  Tech Stack', STYLES.tech)
  console.table(TECH_STACK)
  console.log('')
}
