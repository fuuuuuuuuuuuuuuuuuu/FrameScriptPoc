import type { CSSProperties } from "react"

export type FillFrameProps = {
  children?: React.ReactNode
  style?: CSSProperties
}

export const FillFrame = ({ children, style }: FillFrameProps) => {
  const base: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
  }

  return <div style={style ? { ...base, ...style } : base}>{children}</div>
}

