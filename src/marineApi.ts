/**
 * Open-Meteo Marine API — builds URL, parses wave data.
 * No knowledge of UI. Returns raw data objects only.
 */

import { fetchJson } from './client'

const BASE = 'https://marine-api.open-meteo.com/v1/marine'

const CURRENT_VARS = 'wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period,sea_level_height_msl'
const HOURLY_VARS = 'wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period,swell_wave_direction,sea_level_height_msl'

export type TideStage = 'low' | 'mid' | 'high'
export type TideTrend = 'rising' | 'falling' | 'steady'

export interface MarineCurrentData {
  time: string
  wave_height: number
  wave_period: number
  wave_direction: number
  wind_wave_height: number
  swell_wave_height: number
  swell_wave_period: number
  sea_level_height_msl: number
}

export interface MarineHourlyData {
  time: string[]
  wave_height: number[]
  wave_period: number[]
  wave_direction: number[]
  swell_wave_height: number[]
  swell_wave_period: number[]
  swell_wave_direction: number[]
  sea_level_height_msl: number[]
}

export interface TideCurrentData {
  time: string
  sea_level_height_msl: number
  stage: TideStage
  trend: TideTrend
}

interface MarineApiResponse {
  current: MarineCurrentData
  hourly: MarineHourlyData
}

export interface SurfApiResponse extends MarineApiResponse {
  tide: TideCurrentData | null
}

function buildUrl(lat: number, lon: number): string {
  return `${BASE}?latitude=${lat}&longitude=${lon}&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&forecast_days=1&timezone=auto`
}

function classifyTideStage(height: number, heights: number[]): TideStage {
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  const range = max - min
  if (range <= 0.05) return 'mid'

  const normalized = (height - min) / range
  if (normalized <= 0.35) return 'low'
  if (normalized >= 0.65) return 'high'
  return 'mid'
}

function classifyTideTrend(currentIndex: number, heights: number[]): TideTrend {
  const current = heights[currentIndex]
  const next = heights[currentIndex + 1]
  const prev = heights[Math.max(0, currentIndex - 1)]
  const comparison = next ?? prev
  const delta = comparison - current

  if (Math.abs(delta) < 0.03) return 'steady'
  return delta > 0 ? 'rising' : 'falling'
}

function deriveTide(data: MarineApiResponse): TideCurrentData | null {
  const currentHeight = data.current?.sea_level_height_msl
  const hourlyHeights = data.hourly?.sea_level_height_msl ?? []

  if (currentHeight == null || hourlyHeights.length === 0) return null

  const currentIndex = data.current.time && data.hourly.time
    ? Math.max(0, data.hourly.time.findIndex(time => time >= data.current.time))
    : 0

  return {
    time: data.current.time,
    sea_level_height_msl: currentHeight,
    stage: classifyTideStage(currentHeight, hourlyHeights),
    trend: classifyTideTrend(currentIndex, hourlyHeights),
  }
}

export async function fetchMarineData(lat: number, lon: number) {
  const url = buildUrl(lat, lon)
  const result = await fetchJson<MarineApiResponse>(url)
  if (result.error || !result.data) return result

  const data: SurfApiResponse = {
    ...result.data,
    tide: deriveTide(result.data),
  }

  return { data, error: null }
}
