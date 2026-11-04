import champions from '../data/champions.json'
import themes from '../data/themes.json'
import type { Role } from '../hooks/use-game'

export function getChampionSuggestions(label: string, role: Role) {
  const theme = themes.find((entry) => entry.label === label)
  const suggestions =
    theme?.status === 'curated'
      ? champions.filter(
          (champion) =>
            theme.championIds.includes(champion.id) &&
            (theme.ignoreRoleFilter === true || champion.roles.includes(role)),
        )
      : []
  return { theme, champions: suggestions }
}
