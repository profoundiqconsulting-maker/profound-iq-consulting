import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ReportSection = { id: string; label: string; content: ReactNode };

/* Splits a long report into sticky, tabbed sections so readers jump between parts instead of scrolling one long page. */
export function ReportSectionTabs({
  sections,
  defaultValue,
  className = "",
}: {
  sections: ReportSection[];
  defaultValue?: string;
  className?: string;
}) {
  if (!sections.length) return null;
  return (
    <Tabs
      defaultValue={defaultValue ?? sections[0].id}
      className={`w-full ${className}`}
    >
      <TabsList className="sticky top-0 z-20 mb-8 h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto border border-[#16243d]/15 bg-[#f7f3e8]/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-[#f7f3e8]/80">
        {sections.map(section => (
          <TabsTrigger
            key={section.id}
            value={section.id}
            className="shrink-0 rounded-none border-transparent px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084] data-[state=active]:border-[#c9a34e] data-[state=active]:bg-[#16243d] data-[state=active]:text-[#f7f3e8] data-[state=active]:shadow-none"
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map(section => (
        <TabsContent key={section.id} value={section.id} className="mt-0">
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
