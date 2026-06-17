import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-teal-600" />
      </div>
      <h3 className="text-base font-semibold text-charcoal-800 mb-2">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
