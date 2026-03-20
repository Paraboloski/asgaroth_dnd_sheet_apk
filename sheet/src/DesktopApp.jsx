import './styles/index.css'
import CharacterSheetView from './components/View'
import useCharacterSheet from './scripts/hookSheet'

export default function DesktopLegacyApp() {
  const sheetState = useCharacterSheet()

  return <CharacterSheetView appClassName="app app--desktop" sheetState={sheetState} />
}
