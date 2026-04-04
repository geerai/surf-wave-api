/**
 * Open-Meteo Marine API — builds URL, parses wave data.
 * No knowledge of UI. Returns raw data objects only.
 */

import { fetchJson } from './client'

const BASE = 'https://marine-api.open-meteo.com/v1/marine'

const CURRENT_VARS = 'wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period'
const HOURLY_VARS = 'wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period,swell_wave_direction'

export interface MarineCurrentData {
  wave_height: number
  wave_period: number
  wave_direction: number
  wind_wave_height: number
  swell_wave_height: number
  swell_wave_period: number
}

export interface MarineHourlyData {
  time: string[]
  wave_height: number[]
  wave_period: number[]
  wave_direction: number[]
  swell_wave_height: number[]
  swell_wave_period: number[]
  swell_wave_direction: number[]
}

interface MarineApiResponse {
  current: MarineCurrentData
  hourly: MarineHourlyData
}

function buildUrl(lat: number, lon: number): string {
  return `${BASE}?latitude=${lat}&longitude=${lon}&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&forecast_days=1&timezone=auto`
}

export async function fetchMarineData(lat: number, lon: number) {
  const url = buildUrl(lat, lon)
  return fetchJson<MarineApiResponse>(url)
}
