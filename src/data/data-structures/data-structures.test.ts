import { describe, expect, it } from 'vitest'
import { getLesson } from '../lessons'
import {
  dataStructureLearningPath,
  dataStructures,
  getAvailableDataStructures,
  getComingSoonDataStructures,
  getDataStructureById,
  getDataStructuresStartHref,
  PLACEHOLDER_DATA_STRUCTURE_ROUTES,
  structureScenarios,
  type DataStructureId,
} from './index'

const KNOWN_HUB_ROUTES = new Set([
  '/data-structures',
  '/algorithms/array-string',
  '/algorithms/sorting',
  '/algorithms/searching',
  '/roadmap',
  '/practice',
])

function resolveHref(href: string): { kind: 'hub' | 'lesson' | 'hash'; ok: boolean } {
  const [path, hash] = href.split('#')
  if (path === '/data-structures' && hash) {
    return { kind: 'hash', ok: true }
  }
  if (path.startsWith('/learn/')) {
    const slug = path.slice('/learn/'.length)
    return { kind: 'lesson', ok: getLesson(slug) !== undefined }
  }
  return { kind: 'hub', ok: KNOWN_HUB_ROUTES.has(path) }
}

describe('data structures catalog', () => {
  it('defines the nine core structures with required metadata', () => {
    const expectedIds: DataStructureId[] = [
      'arrays',
      'linked-lists',
      'stacks',
      'queues',
      'hash-tables',
      'trees',
      'heaps',
      'graphs',
      'tries',
    ]

    expect(dataStructures.map((s) => s.id)).toEqual(expectedIds)

    for (const structure of dataStructures) {
      expect(structure.name.length).toBeGreaterThan(0)
      expect(structure.description.length).toBeGreaterThan(0)
      expect(structure.organization.length).toBeGreaterThan(0)
      expect(structure.useCase.length).toBeGreaterThan(0)
      expect(structure.useCases.length).toBeGreaterThan(0)
      expect(structure.operations.length).toBeGreaterThan(0)
      expect(structure.advantages.length).toBeGreaterThan(0)
      expect(structure.limitations.length).toBeGreaterThan(0)
      expect(structure.complexityNote.length).toBeGreaterThan(0)
      expect(['available', 'coming-soon']).toContain(structure.availability)
    }
  })

  it('marks only structures with real learning destinations as available', () => {
    const available = getAvailableDataStructures()
    const comingSoon = getComingSoonDataStructures()

    expect(available.map((s) => s.id).sort()).toEqual(
      ['arrays', 'hash-tables', 'heaps', 'linked-lists'].sort(),
    )
    expect(comingSoon.length).toBe(5)

    for (const structure of available) {
      expect(structure.href).toBeDefined()
      expect(structure.hrefLabel).toBeDefined()
      const resolved = resolveHref(structure.href!)
      expect(resolved.ok, `unresolved href: ${structure.href}`).toBe(true)
      expect(PLACEHOLDER_DATA_STRUCTURE_ROUTES).not.toContain(structure.href)
    }

    for (const structure of comingSoon) {
      expect(structure.href).toBeUndefined()
    }
  })

  it('does not treat placeholder category routes as available content', () => {
    for (const route of PLACEHOLDER_DATA_STRUCTURE_ROUTES) {
      expect(
        dataStructures.some(
          (s) => s.availability === 'available' && s.href === route,
        ),
      ).toBe(false)
    }
  })

  it('resolves selection helpers used by the Structure Explorer', () => {
    expect(getDataStructureById('arrays')?.name).toBe('Arrays')
    expect(getDataStructureById('tries')?.availability).toBe('coming-soon')
    expect(getDataStructureById('hash-tables')?.href).toBe(
      '/learn/frequency-counting',
    )
    expect(getDataStructureById('linked-lists')?.href).toBe(
      '/learn/singly-linked-list',
    )
    expect(getLesson('frequency-counting')).toBeDefined()
    expect(getLesson('heap-sort')).toBeDefined()
    expect(getLesson('singly-linked-list')).toBeDefined()
  })

  it('documents accurate complexity assumptions for arrays and hash tables', () => {
    const arrays = getDataStructureById('arrays')!
    const access = arrays.operations.find((op) =>
      op.name.toLowerCase().includes('access'),
    )
    const search = arrays.operations.find((op) =>
      op.name.toLowerCase().includes('search'),
    )
    expect(access?.complexity).toBe('O(1)')
    expect(search?.complexity).toBe('O(n)')

    const hash = getDataStructureById('hash-tables')!
    const average = hash.operations.find((op) =>
      op.name.toLowerCase().includes('average'),
    )
    const worst = hash.operations.find((op) =>
      op.name.toLowerCase().includes('worst'),
    )
    expect(average?.complexity).toBe('O(1)')
    expect(worst?.complexity).toBe('O(n)')
    expect(hash.complexityNote.toLowerCase()).toContain('degrade')
  })

  it('keeps choosing-guide scenarios aligned with catalog ids', () => {
    expect(structureScenarios.length).toBe(9)
    for (const scenario of structureScenarios) {
      const structure = getDataStructureById(scenario.structureId)
      expect(structure, scenario.id).toBeDefined()
      expect(scenario.structureName.length).toBeGreaterThan(0)
      expect(scenario.need.length).toBeGreaterThan(0)
      expect(scenario.rationale.length).toBeGreaterThan(0)
    }
  })

  it('only links learning-path steps to implemented routes or in-page anchors', () => {
    for (const step of dataStructureLearningPath) {
      if (step.availability === 'coming-soon') {
        expect(step.href).toBeUndefined()
        continue
      }
      expect(step.href).toBeDefined()
      expect(resolveHref(step.href!).ok, step.href).toBe(true)
    }

    expect(getDataStructuresStartHref()).toBe('/algorithms/array-string')
  })
})
