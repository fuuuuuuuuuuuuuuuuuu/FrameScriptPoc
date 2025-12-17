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

export const Project = ({ children }: ProjectProps) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  )
}
