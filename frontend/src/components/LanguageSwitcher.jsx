import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-primaryClr" />
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-terciaryClr text-primaryClr border border-primaryClr/30 rounded-lg px-2 py-2 text-sm font-semibold cursor-pointer hover:border-primaryClr/60 transition-all focus:outline-none focus:border-primaryClr"
      >
        <option value="en">Eng</option>
        <option value="am">አማ</option>
      </select>
    </div>
  )
}

export default LanguageSwitcher
