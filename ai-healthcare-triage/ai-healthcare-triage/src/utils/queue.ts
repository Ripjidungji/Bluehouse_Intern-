import type { Patient, Priority } from '../types'

const rank: Record<Priority, number> = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export function sortQueue(items: Patient[]) {
  return [...items].sort((a, b) => rank[a.priority] - rank[b.priority])
}
