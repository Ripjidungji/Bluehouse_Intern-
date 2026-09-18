import { useEffect, useState } from 'react'
import type { Assessment } from '../types'

export function useAssessment() {
  const [assessment, setAssessment] = useState<Assessment | null>(() => {
    const saved = localStorage.getItem('latest_assessment')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (assessment) localStorage.setItem('latest_assessment', JSON.stringify(assessment))
  }, [assessment])

  return { assessment, setAssessment }
}
