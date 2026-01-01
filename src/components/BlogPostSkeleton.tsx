export default function BlogPostSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="w-full sm:w-64 lg:w-80 h-48 sm:h-64 bg-base-300 rounded-lg flex-shrink-0"></div>
      
      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-8 bg-base-300 rounded w-3/4"></div>
          <div className="h-8 bg-base-300 rounded w-1/2"></div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-base-300 rounded w-full"></div>
          <div className="h-4 bg-base-300 rounded w-full"></div>
          <div className="h-4 bg-base-300 rounded w-5/6"></div>
        </div>

        {/* Read More Skeleton */}
        <div className="h-5 bg-base-300 rounded w-24 mb-4"></div>

        {/* Metadata Skeleton */}
        <div className="flex flex-wrap gap-3 mt-auto">
          <div className="h-4 bg-base-300 rounded w-20"></div>
          <div className="h-4 bg-base-300 rounded w-16"></div>
          <div className="h-4 bg-base-300 rounded w-24"></div>
          <div className="h-4 bg-base-300 rounded w-20"></div>
          <div className="h-4 bg-base-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

