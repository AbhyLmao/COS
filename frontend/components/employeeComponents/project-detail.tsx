"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Project } from '@/utils/types'

interface ProjectDetailProps{
  project: Project
}

export default function ProjectDetail({project} : ProjectDetailProps) {

  return (
    <div>
      <h3>Project title: {project.title}</h3>
        <Button asChild>
            <Link href={`/Employee/Projects/${project.project_id}/Applicants`}>View Applicants</Link>
        </Button>
    </div>
  )
}
