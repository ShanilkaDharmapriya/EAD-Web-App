import { useId } from "react"

type Props = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}
export default function ConfirmDialog({ title, message, confirmText="Confirm", cancelText="Cancel", isOpen, onConfirm, onCancel }: Props) {
  const titleId = useId()
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div role="dialog" aria-labelledby={titleId} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-xl border px-4 py-2" onClick={onCancel} aria-label="Cancel">{cancelText}</button>
          <button className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} aria-label={confirmText}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
