import axios, { AxiosError } from 'axios'

// Base URL for backend API. Falls back to localhost during development.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000').replace(/\/+$/,'')

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

type SubmitBody = { name: string; mbti: string; score: number; imageBase64: string }

export async function submitResult(body: SubmitBody) {
  try {
    const { data } = await api.post('/api/submit', body)
    return data
  } catch (e) {
    const err = e as AxiosError<any>
    if (err.response) {
      const wrapped = new Error(err.response.data?.error || 'Request failed') as Error & { status?: number; data?: any }
      wrapped.status = err.response.status
      wrapped.data = err.response.data
      throw wrapped
    }
    if (err.request) {
      throw new Error('Network error: Unable to reach backend API. Is it running?')
    }
    throw err
  }
}
