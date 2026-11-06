import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}

export function StarRating({
  value,
  size = 16,
  className,
  showValue = false,
  count,
}: StarRatingProps) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">
          {value.toFixed(1)}
          {typeof count === "number" && (
            <span className="text-muted-foreground"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${i} stars`}
        >
          <Star
            className={cn(
              "h-7 w-7",
              i <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
