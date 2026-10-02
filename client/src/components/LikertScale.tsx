/* Shared Likert scale component for executive assessment experiences. */

type LikertScaleOption = {
  value: number;
  label: string;
  description?: string;
};

type LikertScaleProps = {
  id: string;
  question: string;
  index?: number;
  options?: LikertScaleOption[];
  value?: number;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
};

const defaultOptions: LikertScaleOption[] = [
  { value: 1, label: "1", description: "Low" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5", description: "High" },
];

export function LikertScale({
  id,
  question,
  index,
  options = defaultOptions,
  value,
  onChange,
  lowLabel = "Not like me",
  highLabel = "Very like me",
}: LikertScaleProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#16243d]/12 bg-white/70 transition-all duration-300 hover:border-[#c9a34e]/60 hover:shadow-[0_12px_40px_rgba(16,29,53,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#c9a34e] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="p-5 sm:p-7">
        <div className="flex gap-4">
          {typeof index === "number" && (
            <span className="hidden text-xs font-black text-[#7d5e1e] sm:block">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <div className="w-full">
            <p className="text-base leading-7 font-semibold text-[#16243d] sm:text-lg">
              {question}
            </p>
            <div className="mt-5 grid grid-cols-5 gap-2 sm:max-w-xl">
              {options.map(option => {
                const isSelected = value === option.value;
                return (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all duration-200 ${
                      isSelected
                        ? "border-[#c9a34e] bg-[#16243d] text-[#f7f3e8] shadow-sm"
                        : "border-[#16243d]/15 bg-white text-[#657084] hover:border-[#c9a34e]/70 hover:text-[#16243d]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={id}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => onChange(option.value)}
                      className="sr-only"
                    />
                    <span
                      className={`text-lg font-bold ${isSelected ? "text-[#8b6914]" : "text-[#16243d]"}`}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-[.1em] ${isSelected ? "text-[#c1cad7]" : "text-[#657084]"}`}
                      >
                        {option.description}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex max-w-xl items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-[#657084]">
              <span>{lowLabel}</span>
              <span>{highLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
