import React from "react"

export type ProjectSettings = {
  name: string
  width: number
  height: number
  fps: number
}

type ProjectProps = {
  children: React.ReactNode
}

// Thin wrapper kept for API compatibility; settings are read directly from PROJECT_SETTINGS.
export const Project = ({ children }: ProjectProps) => {
  return <>{children}</>
}
