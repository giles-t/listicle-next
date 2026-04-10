"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-heading-2 font-heading-2 text-default-font">
        Something went wrong
      </h2>
      <p className="text-body font-body text-subtext-color">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
