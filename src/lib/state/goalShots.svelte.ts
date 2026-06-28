export const goalShots = $state({ items: [] as { id: number; url: string }[] })

let nextId = 0

export function addGoalShot(blob: Blob) {
  goalShots.items.push({ id: nextId++, url: URL.createObjectURL(blob) })
}

export function clearGoalShots() {
  for (const s of goalShots.items) URL.revokeObjectURL(s.url)
  goalShots.items = []
}
