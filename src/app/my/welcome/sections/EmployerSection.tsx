'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getDayOptions,
  getMonthOptions,
  getYearOptions,
} from '@/lib/time-functions'
import { WelcomeData } from '@/lib/welcome-data'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface EmployerEntry {
  employer_name: string
  start_year?: number
  start_month?: number
  start_day?: number
  end_year?: number
  end_month?: number
  end_day?: number
}

interface EmployerSectionProps {
  welcomeData: WelcomeData
  setWelcomeData: (data: WelcomeData) => void
  nextStep: () => void
  prevStep: () => void
}

export function EmployerSection({
  welcomeData,
  setWelcomeData,
  nextStep,
  prevStep,
}: EmployerSectionProps) {
  // Initialize noEmployer based on whether welcomeData has employers
  const [noEmployer, setNoEmployer] = useState(
    !welcomeData.employers || welcomeData.employers.length === 0
  )

  const [employers, setEmployers] = useState<EmployerEntry[]>(
    welcomeData.employers && welcomeData.employers.length > 0
      ? welcomeData.employers
      : [
          {
            employer_name: '',
            start_year: undefined,
            start_month: undefined,
            start_day: undefined,
          },
        ]
  )
  const [showValidation, setShowValidation] = useState(false)
  const [multiEmployer, setMultiEmployer] = useState(false)

  const yearOptions = getYearOptions(1900, new Date().getFullYear())
  const monthOptions = getMonthOptions()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentDay = new Date().getDate()

  // Helper to get filtered month/day options for a given employer
  const getFilteredMonthOptions = (year: number | '') => {
    if (year === currentYear) {
      return monthOptions.filter(m => m.value <= currentMonth)
    }
    return monthOptions
  }
  const getFilteredDayOptions = (year: number | '', month: number | '') => {
    if (year === currentYear && month === currentMonth) {
      return getDayOptions(year || currentYear, month || 1).filter(
        d => d.value <= currentDay
      )
    }
    return getDayOptions(year || currentYear, month || 1)
  }

  // Add new employer entry
  const handleAddEmployer = () => {
    setEmployers(prev => [
      ...prev,
      {
        employer_name: '',
        start_year: undefined,
        start_month: undefined,
        start_day: undefined,
      },
    ])
    setMultiEmployer(true)
  }

  // Remove employer entry
  const handleRemoveEmployer = (idx: number) => {
    setEmployers(prev => prev.filter((_, i) => i !== idx))
  }

  // Update employer entry
  const handleEmployerChange = (
    idx: number,
    field: keyof EmployerEntry,
    value: string | number
  ) => {
    setEmployers(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  // No employer checkbox
  const handleNoEmployerChange = (checked: boolean) => {
    setNoEmployer(checked)
    if (checked) {
      setEmployers([])
    } else {
      // Always ensure at least one employer entry when checkbox is unchecked
      setEmployers(prev =>
        prev.length > 0
          ? prev
          : [
              {
                employer_name: '',
                start_year: undefined,
                start_month: undefined,
                start_day: undefined,
              },
            ]
      )
    }
  }

  // Validation: at least one employer with all fields filled, or no employer
  const isValid =
    noEmployer ||
    (employers.length > 0 &&
      employers.every(
        e =>
          e.employer_name.trim() && e.start_year && e.start_month && e.start_day
      ))

  // On next, show validation if not valid
  const handleNext = () => {
    setShowValidation(true)
    if (!isValid) return
    // Sort employers by start date, most recent first
    const sorted = [...employers]
      .filter(
        e =>
          e.employer_name.trim() && e.start_year && e.start_month && e.start_day
      )
      .map(e => ({
        ...e,
        start_year: Number(e.start_year),
        start_month: Number(e.start_month),
        start_day: Number(e.start_day),
      }))
      .sort((a, b) => {
        const aDate = new Date(a.start_year, a.start_month - 1, a.start_day)
        const bDate = new Date(b.start_year, b.start_month - 1, b.start_day)
        return bDate.getTime() - aDate.getTime()
      })
    setWelcomeData({
      ...welcomeData,
      employers: noEmployer ? [] : sorted,
    })
    nextStep()
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Employer
        </Heading>
        <p className='text-muted-foreground'>
          Tell us about your current employer(s) to help personalize your
          experience.
        </p>
      </div>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='no-employer'
              checked={noEmployer}
              onCheckedChange={handleNoEmployerChange}
            />
            <Label htmlFor='no-employer' className='text-sm'>
              I do not have an employer
            </Label>
          </div>
          {!noEmployer && (
            <>
              {employers.map((employer, idx) => (
                <div key={idx} className='flex items-end gap-4'>
                  <div className='flex-[2]'>
                    <Label htmlFor={`employer-${idx}`} className='mb-1 block'>
                      Employer Name
                    </Label>
                    <Input
                      id={`employer-${idx}`}
                      type='text'
                      placeholder='Enter employer name'
                      value={employer.employer_name}
                      onChange={e =>
                        handleEmployerChange(
                          idx,
                          'employer_name',
                          e.target.value
                        )
                      }
                      className='h-auto w-full min-w-0 px-4 py-2 text-lg'
                    />
                  </div>
                  <div className='flex-[1]'>
                    <Label className='mb-1 block'>Start Date</Label>
                    <div className='flex items-center gap-2'>
                      <Select
                        value={
                          employer.start_year !== undefined
                            ? employer.start_year.toString()
                            : ''
                        }
                        onValueChange={value =>
                          handleEmployerChange(idx, 'start_year', Number(value))
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Year' />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map(year => (
                            <SelectItem
                              key={year.value}
                              value={year.value.toString()}
                            >
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={
                          employer.start_month !== undefined
                            ? employer.start_month.toString()
                            : ''
                        }
                        onValueChange={value =>
                          handleEmployerChange(
                            idx,
                            'start_month',
                            Number(value)
                          )
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Month' />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredMonthOptions(
                            typeof employer.start_year === 'number'
                              ? employer.start_year
                              : 1
                          ).map(month => (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={
                          employer.start_day !== undefined
                            ? employer.start_day.toString()
                            : ''
                        }
                        onValueChange={value =>
                          handleEmployerChange(idx, 'start_day', Number(value))
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Day' />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredDayOptions(
                            typeof employer.start_year === 'number'
                              ? employer.start_year
                              : 1,
                            typeof employer.start_month === 'number'
                              ? employer.start_month
                              : 1
                          ).map(day => (
                            <SelectItem
                              key={day.value}
                              value={day.value.toString()}
                            >
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {multiEmployer && employers.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleRemoveEmployer(idx)}
                      className='ml-2 text-xs text-red-500'
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type='button'
                className='text-primary mt-2 flex items-center text-sm hover:underline'
                onClick={handleAddEmployer}
              >
                <Plus className='mr-1 h-4 w-4' /> I have more than one employer
              </button>
              {showValidation && !isValid && (
                <p className='text-sm text-red-500'>
                  Please provide all employer names and start dates, or check
                  &quot;I do not have an employer&quot;.
                </p>
              )}
            </>
          )}
        </div>
        <div className='flex justify-between'>
          <Button variant='ghost' onClick={prevStep}>
            Back
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </div>
    </div>
  )
}
