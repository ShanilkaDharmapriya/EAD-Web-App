import { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
export default function LoadingButton({ loading, disabled, children, ...rest}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 ${rest.className ?? ""} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {loading ? <span className="mr-2 animate-pulse">⋯</span> : null}
      {children}
    </button>
  )
}
