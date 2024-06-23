import { cn } from '@/lib/cn'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Biohazard,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Download,
  Edit,
  EyeOff,
  Github,
  Laptop,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  LucideIcon,
  LucideProps,
  Moon,
  Plus,
  PlusCircle,
  Save,
  Settings,
  Settings2,
  Sun,
  Trash,
  User,
  X
} from 'lucide-react'

export type Icon = LucideIcon

export const Icons = {
  logo: Biohazard,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  chevronLeft: ChevronLeft,
  arrowRight: ArrowRight,
  github: Github,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      {...props}
      className={cn('fill-current', props.className)}
    >
      <path d="M 15.003906 3 C 8.3749062 3 3 8.373 3 15 C 3 21.627 8.3749062 27 15.003906 27 C 25.013906 27 27.269078 17.707 26.330078 13 L 25 13 L 22.732422 13 L 15 13 L 15 17 L 22.738281 17 C 21.848702 20.448251 18.725955 23 15 23 C 10.582 23 7 19.418 7 15 C 7 10.582 10.582 7 15 7 C 17.009 7 18.839141 7.74575 20.244141 8.96875 L 23.085938 6.1289062 C 20.951937 4.1849063 18.116906 3 15.003906 3 z"></path>
    </svg>
  ),
  login: LogIn,
  logout: LogOut,
  user: User,
  spinner: Loader2,
  settings: Settings,
  close: X,
  add: Plus,
  edit: Edit,
  save: Save,
  delete: Trash,
  download: Download,
  dashboard: LayoutDashboard,
  task: ClipboardList,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowUpDown: ArrowUpDown,
  eyeOff: EyeOff,
  plusCircle: PlusCircle,
  check: Check,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  chevronRight: ChevronRight,
  mixer: Settings2
}
