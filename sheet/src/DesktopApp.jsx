import './styles/index.css'
import CharacterSheetView from './components/View'
import useCharacterSheet from './scripts/hookSheet'

export default function DesktopLegacyApp({ theme, onToggleTheme }) {
  const sheetState = useCharacterSheet()

  return (
    <CharacterSheetView
      appClassName="app app--desktop"
      sheetState={sheetState}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  )
}
