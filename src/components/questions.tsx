import { useState } from "react";
import BaseLayout from "../layout/base";
import SectionHeader from "./ui/section_header";
import { ChevronRight, HelpCircle } from "lucide-react";
import Modal from "./ui/modal";
import { useTranslation } from "react-i18next";

interface FAQItem {
  category: string;
  ask: string;
  answer: string;
}

export default function Questions() {
  const [selectedQuestion, setSelectedQuestion] = useState<FAQItem | null>(
    null
  );
  const { t } = useTranslation();

  const data = t("faq.items", { returnObjects: true }) as FAQItem[];

  // Split data into two balanced columns
  const midPoint = Math.ceil(data.length / 2);
  const leftColumn = data.slice(0, midPoint);
  const rightColumn = data.slice(midPoint);

  const FAQItemComponent = ({
    item,
    onClick,
  }: {
    item: FAQItem;
    onClick: () => void;
  }) => (
    <div className="rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:shadow-md transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-4 text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-50 text-slate-500 group-hover:text-red-600 flex items-center justify-center transition-colors duration-300">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 group-hover:text-red-600 transition-colors">
              {item.category}
            </span>
            <h3 className="font-semibold text-sm mt-1 text-slate-700 group-hover:text-slate-900 transition-colors">
              {item.ask}
            </h3>
          </div>
        </div>
        <ChevronRight className="flex-shrink-0 ml-2 w-4 h-4 text-slate-300 group-hover:text-red-600 transition-colors duration-300" />
      </button>
    </div>
  );

  return (
    <BaseLayout className="flex-col justify-between py-16">
      <SectionHeader
        title={t("faq.title")}
        highlight="Pertanyaan"
        subtitle={t("faq.desc")}
      />

      {/* Two Independent Columns */}
      <div className="w-full flex flex-col md:flex-row gap-4">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-4">
          {leftColumn.map((item, index) => (
            <FAQItemComponent
              key={`left-${index}`}
              item={item}
              onClick={() => setSelectedQuestion(item)}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-4">
          {rightColumn.map((item, index) => (
            <FAQItemComponent
              key={`right-${index}`}
              item={item}
              onClick={() => setSelectedQuestion(item)}
            />
          ))}
        </div>
      </div>

      {/* Modal for Answer */}
      <Modal
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        title={selectedQuestion?.ask}
      >
        <div className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedQuestion?.answer ?? '' }} />
      </Modal>
    </BaseLayout>
  );
}
