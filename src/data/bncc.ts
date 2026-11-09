import raw from '../data/bncc.json'
import type { BnccSkill, Stage } from '../lib/types'
import { getTopic } from '../data/topics'

export const BNCC_SKILLS = raw as BnccSkill[]
export const BNCC_SOURCE = 'BNCC 2018 — dados oficiais do MEC'

const byCode = new Map(BNCC_SKILLS.map((skill) => [skill.code, skill]))

export function getSkill(code: string): BnccSkill | undefined {
  return byCode.get(code)
}

export function stageFromYear(year: number): Stage {
  if (year === 0) return 'EM'
  if (year <= 5) return 'EF1'
  return 'EF2'
}

export function skillsFor(stage: Stage, year: number): BnccSkill[] {
  if (stage === 'EM') return BNCC_SKILLS.filter((skill) => skill.stage === 'EM')
  return BNCC_SKILLS.filter((skill) => skill.stage !== 'EM' && skill.years.includes(year))
}

export function unitsFor(stage: Stage, year: number): string[] {
  return [...new Set(skillsFor(stage, year).map((skill) => skill.unit))]
}

export function suggestSkills(stage: Stage, year: number, topicId: string, limit = 4): BnccSkill[] {
  const topic = getTopic(topicId)
  const candidates = skillsFor(stage, year)
  const terms = [...topic.keywords, topic.unit.toLowerCase(), topic.shortName.toLowerCase()]
    .map((term) => term.toLowerCase())
    .filter(Boolean)

  const scored = candidates.map((skill) => {
    const text = `${skill.description} ${skill.object} ${skill.unit}`.toLowerCase()
    let score = 0
    if (skill.unit.toLowerCase() === topic.unit.toLowerCase()) score += 4
    terms.forEach((term) => {
      if (term.length > 2 && text.includes(term)) score += term.length > 8 ? 4 : 2
    })
    if (skill.object.toLowerCase().includes(topic.shortName.toLowerCase())) score += 3
    return { skill, score }
  })

  scored.sort((a, b) => b.score - a.score || a.skill.code.localeCompare(b.skill.code))
  const result = scored.filter((item) => item.score > 0).slice(0, limit).map((item) => item.skill)
  return result.length ? result : candidates.slice(0, limit)
}

export function searchSkills(query: string, stage?: Stage, year?: number, limit = 30): BnccSkill[] {
  const q = query.trim().toLowerCase()
  return filterSkills(stage, year)
    .filter(
      (skill) =>
        !q ||
        skill.code.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.object.toLowerCase().includes(q),
    )
    .slice(0, limit)
}

export function filterSkills(stage?: Stage, year?: number): BnccSkill[] {
  if (!stage && !year) return BNCC_SKILLS
  if (stage === 'EM') return BNCC_SKILLS.filter((skill) => skill.stage === 'EM')
  if (year !== undefined) {
    return BNCC_SKILLS.filter(
      (skill) => skill.stage !== 'EM' && skill.years.includes(year),
    )
  }
  return BNCC_SKILLS.filter((skill) => skill.stage === stage)
}

export function getSkillText(code: string): string {
  return getSkill(code)?.description ?? ''
}
