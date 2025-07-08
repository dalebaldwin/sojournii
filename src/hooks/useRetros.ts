import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export interface Retro {
  _id: Id<'retros'>
  user_id: string
  week_start_date: string
  week_end_date: string
  general_feelings: number
  work_relationships: number
  professional_growth: number
  productivity: number
  personal_wellbeing: number
  positive_outcomes: string
  positive_outcomes_html?: string
  positive_outcomes_json?: string
  negative_outcomes: string
  negative_outcomes_html?: string
  negative_outcomes_json?: string
  key_takeaways: string
  key_takeaways_html?: string
  key_takeaways_json?: string
  completed_at?: number // Now optional
  created_at: number
  updated_at: number
}

export interface RetroFormData {
  general_feelings: number
  work_relationships: number
  professional_growth: number
  productivity: number
  personal_wellbeing: number
  positive_outcomes: string
  positive_outcomes_html?: string
  positive_outcomes_json?: string
  negative_outcomes: string
  negative_outcomes_html?: string
  negative_outcomes_json?: string
  key_takeaways: string
  key_takeaways_html?: string
  key_takeaways_json?: string
}

// Hook to get all retros
export function useRetros() {
  return useQuery(api.retros.listRetros)
}

// Hook to get a specific retro
export function useRetro(retroId?: Id<'retros'>) {
  return useQuery(api.retros.getRetro, retroId ? { id: retroId } : 'skip')
}

// Hook to get current week's retro
export function useCurrentWeekRetro() {
  return useQuery(api.retros.getCurrentWeekRetro)
}

// Hook to get retro by week
export function useRetroByWeek(weekStartDate: string) {
  return useQuery(api.retros.getRetroByWeek, { weekStartDate })
}

// Hook to get current week info
export function useCurrentWeekInfo() {
  return useQuery(api.retros.getCurrentWeekInfo)
}

// Hook to create a new retro
export function useCreateRetro() {
  return useMutation(api.retros.createRetro)
}

// Hook to update a retro
export function useUpdateRetro() {
  return useMutation(api.retros.updateRetro)
}

// Hook to delete a retro
export function useDeleteRetro() {
  return useMutation(api.retros.deleteRetro)
}
