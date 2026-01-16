import TerminalIcon from '@/assets/MaterialSymbolsTerminal.svg'
import VueIcon from '@/assets/vue.svg'
import RecordIcon from '@/assets/StreamlineUltimateColorVinylRecord.svg'

export interface AppItem {
  id: string
  name: string
  path: string
  icon: string
  description?: string
  external?: boolean
}

export const apps: AppItem[] = [
  {
    id: 'tags',
    name: '标签',
    path: '/tags',
    icon: VueIcon,
    description: '标签'
  },
  {
    id: 'archives',
    name: '归档',
    path: '/archives',
    icon: VueIcon,
    description: '归档'
  },
  {
    id: 'timeline',
    name: '时间线',
    path: '/timeline',
    icon: VueIcon,
    description: '时间线'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    path: '/terminal',
    icon: TerminalIcon,
    description: 'Command line interface'
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    path: '/cosmos',
    icon: VueIcon,
    description: 'Cosmos'
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    path: '/games/snake',
    icon: VueIcon,
    description: '贪吃蛇游戏'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  },
  {
    id: 'docs',
    name: 'Documentation',
    path: '/guide/intro',
    icon: VueIcon,
    description: 'Project Documentation'
  }
]
