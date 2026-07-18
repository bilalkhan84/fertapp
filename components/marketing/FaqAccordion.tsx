"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto divide-y divide-charcoal-100 border-y border-charcoal-100">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-sm sm:text-base font-medium text-charcoal-900">
                {item.question}
              </span>
              <ChevronDown
                className={[
                  "w-4.5 h-4.5 text-charcoal-400 shrink-0 transition-transform duration-200",
                  isOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
            {isOpen && (
              <p className="pb-5 -mt-2 text-sm text-charcoal-600 leading-relaxed pr-8">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
