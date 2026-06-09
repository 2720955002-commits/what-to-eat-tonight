import PickSettingsPanel from '@/components/PickSettingsPanel'
import StapleIngredientsPanel from '@/components/StapleIngredientsPanel'

function SettingsPage() {
  return (
    <div className="space-y-6 px-4 pt-6">
      <h2 className="mb-6 text-xl font-semibold text-text-primary md:text-2xl">设置</h2>
      <PickSettingsPanel />
      <StapleIngredientsPanel />
    </div>
  )
}

export default SettingsPage
