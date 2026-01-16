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
    id: 'terminal',
    name: 'Terminal',
    path: '/terminal',
    icon: TerminalIcon,
    description: 'Command line interface'
  },
  {
    id: 'snake',
    name: 'Deep Snake',
    path: '/games/snake',
    icon: VueIcon, // Placeholder
    description: 'Classic Snake Game'
  },
  {
    id: 'music',
    name: 'Music',
    path: '/music', // Assuming a route or just a placeholder
    icon: RecordIcon,
    description: 'Music Player'
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
