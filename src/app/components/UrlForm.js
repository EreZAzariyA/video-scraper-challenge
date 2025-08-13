"use client";

export default function UrlForm({ inputUrl, onInputChange, onSubmit, isPending, canSubmit }) {
  const handleClear = () => {
    onInputChange("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] items-start">
      <div className="relative">
        <input
          type="url"
          inputMode="url"
          placeholder="https://www.cbssports.com/watch/nfl/video/is-it-a-surprise-that-micah-parsons-is-being-strung-along-by-cowboys"
          value={inputUrl}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full h-12 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black/20 px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
          aria-label="Video URL"
          required
        />
        {inputUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors"
            aria-label="Clear input"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="h-12 px-5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Extracting…" : "Extract metadata"}
      </button>
    </form>
  );
}
