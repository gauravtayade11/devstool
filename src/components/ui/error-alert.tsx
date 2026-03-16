import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  detail?: string;
  className?: string;
}

export function ErrorAlert({ message, detail, className = "" }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400 text-sm ${className}`}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-semibold">{message}</p>
        {detail && <p className="text-red-300 mt-1">{detail}</p>}
      </div>
    </div>
  );
}
