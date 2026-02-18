"use client"

import { LABELS } from "../config"
import type { ExitConfirmDialogProps } from "../types"

export const ExitConfirmDialog = ({ isOpen, onCancel, onConfirm }: ExitConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full bg-[#242424] rounded-t-3xl px-5 pt-6 pb-10 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">🚪</div>
          <div className="text-lg font-black text-white">{LABELS.exitConfirm.title}</div>
          <div className="text-sm text-gray-400 mt-1">{LABELS.exitConfirm.description}</div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold text-base transition-all active:scale-95"
          >
            {LABELS.exitConfirm.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-red-500/90 hover:bg-red-500 text-white rounded-2xl font-bold text-base transition-all active:scale-95"
          >
            {LABELS.exitConfirm.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
