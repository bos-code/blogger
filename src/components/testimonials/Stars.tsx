import { StarIcon } from "@heroicons/react/24/solid";

/** Read-only star rating out of five. */
export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }): React.ReactElement {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <StarIcon key={value} className={`${className} ${value <= rating ? "text-warning" : "text-base-content/20"}`} aria-hidden="true" />
      ))}
    </span>
  );
}

/** Star rating picker (radio group, keyboard accessible). */
export function StarInput({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }): React.ReactElement {
  return (
    <fieldset>
      <legend className="field-label">Rating (optional)</legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="relative cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-primary">
            <input
              type="radio"
              name="testimonial-rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
            />
            <StarIcon className={`h-7 w-7 ${value && star <= value ? "text-warning" : "text-base-content/25"}`} aria-hidden="true" />
            <span className="sr-only">{star} star{star > 1 ? "s" : ""}</span>
          </label>
        ))}
        {value && (
          <button type="button" className="btn btn-ghost btn-xs ml-2" onClick={() => onChange(null)}>
            Clear
          </button>
        )}
      </div>
    </fieldset>
  );
}
