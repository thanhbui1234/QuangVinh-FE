import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { motion } from 'framer-motion'

export const SwitchMode = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        theme === 'dark' ? 'bg-slate-700' : 'bg-orange-100'
      }`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <span className="sr-only">Toggle theme</span>
      <motion.span
        className={`pointer-events-none relative h-7 w-7 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center`}
        animate={{
          x: theme === 'dark' ? 24 : 0,
          rotate: theme === 'dark' ? 360 : 0,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 0 : 1,
            opacity: theme === 'dark' ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-4 w-4 text-orange-500 fill-orange-500" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            opacity: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-4 w-4 text-slate-900 fill-slate-900" />
        </motion.div>
      </motion.span>
    </div>
  )
}
