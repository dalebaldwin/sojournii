import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export interface PerformanceQuestion {
  _id: Id<'performance_questions'>
  user_id: string
  title: string
  description: string
  description_html?: string
  description_json?: string
  order: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface PerformanceResponse {
  _id: Id<'performance_responses'>
  user_id: string
  question_id: Id<'performance_questions'>
  week_start_date: string
  response: string
  response_html?: string
  response_json?: string
  created_at: number
  updated_at: number
}

export interface WeeklyResponsesData {
  weekStartDate: string
  responses: PerformanceResponse[]
  questions: PerformanceQuestion[]
}

// Performance Questions Hooks
export function usePerformanceQuestions(includeInactive = false) {
  return useQuery(api.performanceQuestions.listQuestions, { includeInactive })
}

export function useDisabledQuestions() {
  return useQuery(api.performanceQuestions.getDisabledQuestions)
}

export function usePerformanceQuestion(
  questionId?: Id<'performance_questions'>
) {
  return useQuery(
    api.performanceQuestions.getQuestion,
    questionId ? { id: questionId } : 'skip'
  )
}

export function useCreateQuestion() {
  return useMutation(api.performanceQuestions.createQuestion)
}

export function useUpdateQuestion() {
  return useMutation(api.performanceQuestions.updateQuestion)
}

export function useDeleteQuestion() {
  return useMutation(api.performanceQuestions.deleteQuestion)
}

export function useReorderQuestions() {
  return useMutation(api.performanceQuestions.reorderQuestions)
}

// Performance Responses Hooks
export function usePerformanceResponses(
  questionId?: Id<'performance_questions'>,
  weekStartDate?: string
) {
  return useQuery(api.performanceResponses.listResponses, {
    questionId,
    weekStartDate,
  })
}

export function usePerformanceResponse(
  responseId?: Id<'performance_responses'>
) {
  return useQuery(
    api.performanceResponses.getResponse,
    responseId ? { id: responseId } : 'skip'
  )
}

export function useWeeklyResponses(weekStartDate?: string) {
  return useQuery(api.performanceResponses.getWeeklyResponses, {
    weekStartDate,
  })
}

export function useCreateResponse() {
  return useMutation(api.performanceResponses.createResponse)
}

export function useUpdateResponse() {
  return useMutation(api.performanceResponses.updateResponse)
}

export function useDeleteResponse() {
  return useMutation(api.performanceResponses.deleteResponse)
}

export function useCurrentWeekInfo() {
  return useQuery(api.performanceResponses.getCurrentWeekInfo)
}

export function useResponseHistory(
  questionId: Id<'performance_questions'>,
  limit?: number
) {
  return useQuery(api.performanceResponses.getResponseHistory, {
    questionId,
    limit,
  })
}
