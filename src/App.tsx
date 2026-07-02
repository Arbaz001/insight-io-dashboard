import { Toast } from './components/Toast'
import { EmergencyStop } from './components/controls/EmergencyStop'
import { Joystick } from './components/controls/Joystick'
import { ZoomSlider } from './components/controls/ZoomSlider'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { Stage } from './components/views/Stage'
import { useKeyboardDrive } from './hooks/useKeyboardDrive'
import { useTelemetrySim } from './hooks/useTelemetrySim'
import { useDashboard } from './lib/store'

/**
 * Insight.IO — robot mission-control dashboard.
 *
 * Layout: a fixed sidebar rail beside a full-bleed viewport (the Stage) that is
 * overlaid with the floating top bar and the right/left control clusters. All
 * shared state lives in the Zustand store in `lib/store.ts`.
 */
export default function App() {
  useTelemetrySim()
  useKeyboardDrive()

  const estop = useDashboard((s) => s.estop)

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />

      <main className="relative flex-1 overflow-hidden bg-canvas">
        <Stage />
        <TopBar />

        {/* Left control: map zoom, sitting beside the picture-in-picture. */}
        <div className="absolute bottom-6 left-3 z-10">
          <ZoomSlider />
        </div>

        {/* Right controls: emergency stop + teleop joystick. */}
        <div className="absolute right-5 bottom-5 z-10 flex flex-col items-center gap-5">
          <EmergencyStop />
          <Joystick />
        </div>

        {/* Full-frame alarm border while the e-stop is latched. */}
        {estop && (
          <div className="animate-alarm pointer-events-none absolute inset-0 z-30 border-4 border-estop-red" />
        )}

        <Toast />
      </main>
    </div>
  )
}
