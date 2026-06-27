import { Vector3 } from 'three'

export const ENEMY_RADIUS = 0.2

// 玩家把機殼改白前先把原始(黑)材質存這，敵機沿用以保留黑殼
export const originalShell: { mat: any } = { mat: null }

// 兩台敵機的世界座標，由 Enemies.svelte 每幀更新、Drone.svelte 讀取做碰撞
export const enemies = [new Vector3(0, 3.3, -5.6), new Vector3(0, 3.3, -4.9)]
