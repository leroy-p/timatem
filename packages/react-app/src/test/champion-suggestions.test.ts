import { describe, expect, it } from 'vitest'
import champions from '../data/champions.json'
import themes from '../data/themes.json'
import { roles } from '../hooks/use-game'
import { getChampionSuggestions } from '../utils/champion-suggestions'

describe('champion suggestions', () => {
  it('keeps data references and positions consistent', () => {
    const ids = champions.map((champion) => champion.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(themes.map((theme) => theme.label)).size).toBe(themes.length)
    for (const champion of champions) {
      expect(new Set(champion.roles).size).toBe(champion.roles.length)
      for (const role of champion.roles) expect(roles).toContain(role)
    }
    for (const theme of themes) {
      expect(new Set(theme.championIds).size).toBe(theme.championIds.length)
      for (const id of theme.championIds) expect(ids).toContain(id)
      if (theme.status === 'curated') {
        expect(theme.championIds.length).toBeGreaterThan(0)
        expect(theme.sources.length).toBeGreaterThan(0)
      }
    }
  })

  it('intersects the theme and position', () => {
    const { champions: matches } = getChampionSuggestions('Yordle', 'support')
    expect(matches.map((champion) => champion.id)).toContain('Lulu')
    expect(matches.map((champion) => champion.id)).not.toContain('Kennen')
    for (const theme of themes) {
      for (const role of roles) {
        for (const champion of getChampionSuggestions(theme.label, role).champions) {
          expect(theme.championIds).toContain(champion.id)
          if (theme.ignoreRoleFilter !== true) expect(champion.roles).toContain(role)
        }
      }
    }
  })

  it('does not invent suggestions for missing, pending or contextual themes', () => {
    for (const label of [
      'Inconnu',
      ...themes.filter((theme) => theme.status !== 'curated').map((theme) => theme.label),
    ]) {
      expect(getChampionSuggestions(label, 'mid').champions).toEqual([])
    }
  })
})

it('shows the full tank class at every position for the damage items challenge', () => {
  const expected = champions.filter((champion) => champion.classes.includes('Tank')).map((champion) => champion.id)
  for (const role of roles) {
    const result = getChampionSuggestions('Classe tank, items dégats', role)
    expect(result.champions.map((champion) => champion.id)).toEqual(expected)
    expect(result.theme?.difficulty).toBe(5)
  }
})

it('suggests every catalog jungler at every position for the Jungle theme', () => {
  const expected = champions.filter((champion) => champion.roles.includes('jungle')).map((champion) => champion.id)
  for (const role of roles) {
    const result = getChampionSuggestions('Jungle', role)
    expect(result.champions.map((champion) => champion.id)).toEqual(expected)
    expect(result.theme?.difficulty).toBe(4)
  }
})
