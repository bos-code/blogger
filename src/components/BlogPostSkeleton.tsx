/** Placeholder card shown while posts load. */
export default function BlogPostSkeleton(): React.ReactElement {
  return (
    <div className="surface overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-5 w-11/12" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="mt-3 flex items-center gap-2">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
