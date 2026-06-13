import { AlertCircle } from "lucide-react";

export default function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-red-200 text-sm">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-red-400 shrink-0" />
        <span className="font-medium text-red-300">Generation Error</span>
      </div>
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 self-start rounded-lg bg-red-400/20 px-3 py-1.5 text-xs font-semibold hover:bg-red-400/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
