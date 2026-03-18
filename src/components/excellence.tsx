import { useState } from "react";
import BaseLayout from "../layout/base";
import SectionHeader from "./ui/section_header";
import { useTranslation } from "react-i18next";
import {
  Check,
  ShieldCheck,
  CreditCard,
  Truck,
  Building2,
  Award,
  Clock,
  Lock,
  Globe,
} from "lucide-react";

const Description = ({ text, points }: { text: string; points: string[] }) => {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">{text}</p>
      <ul className="space-y-2">
        {points?.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </span>
            <span className="text-sm" dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const Excellence = () => {
  const [selected, setSelected] = useState(0);
  const { t } = useTranslation();

  const iconMap = [ShieldCheck, CreditCard, Truck, Building2];
  const colorMap = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-pink-500",
  ];
  const bgColorMap = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];

  const featureIcons = [
    [Award, Check, Globe],
    [Clock, CreditCard, Check],
    [Lock, Truck, Check],
    [Building2, Globe, Check],
  ];

  const itemsData = t("excellence.items", { returnObjects: true });
  const items = (Array.isArray(itemsData) ? itemsData : []).map((item: any, index: number) => ({
    ...item,
    icon: iconMap[index] || ShieldCheck,
    color: colorMap[index] || "from-slate-400 to-slate-500",
    bgColor: bgColorMap[index] || "bg-slate-500",
    featureIcons: featureIcons[index] || [Check, Check, Check],
    points: item.points || [],
    features: (item.features || []).map((label: string, i: number) => ({
      label,
      icon: (featureIcons[index] || [Check, Check, Check])[i] || Check,
    })),
  }));

  return (
    <BaseLayout className="flex-col">
      <div className="w-full">
        <SectionHeader
          badge={t("excellence.badge")}
          title={t("excellence.title")}
          subtitle={t("excellence.subtitle")}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 md:overflow-visible md:pb-0 md:flex-wrap md:justify-center scrollbar-hide">
          {items.map(({ title }, index) => (
            <button
              key={`title-excellence-${index}`}
              onClick={() => setSelected(index)}
              className={`whitespace-nowrap px-4 py-2.5 md:px-5 md:py-3 rounded-full text-sm font-medium transition-all duration-300 ${selected === index
                ? "bg-red-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Content */}
        {items.map((item, index) => {
          if (index !== selected) return null;
          const Icon = item.icon;

          return (
            <div
              key={`desc-excellence-${index}`}
              className="flex flex-col lg:flex-row gap-8 items-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8"
            >
              {/* Visual Illustration */}
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Background decoration */}
                  <div
                    className={`absolute -inset-4 bg-gradient-to-r ${item.color} rounded-3xl opacity-20 blur-xl`}
                  />

                  {/* Main card */}
                  <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-[320px]">
                    {/* Top icon */}
                    <div
                      className={`w-20 h-20 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h4 className="text-xl font-bold text-slate-800 text-center mb-6">
                      {item.title}
                    </h4>

                    {/* Feature badges */}
                    <div className="space-y-3">
                      {item.features.map((feature: any, i: number) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 bg-slate-50 rounded-lg p-3"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg ${item.bgColor} bg-opacity-20 flex items-center justify-center`}
                            >
                              <FeatureIcon
                                className={`w-4 h-4 ${item.bgColor.replace(
                                  "bg-",
                                  "text-"
                                )}`}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {feature.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Decorative elements */}
                    <div
                      className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r ${item.color} rounded-full`}
                    />
                    <div
                      className={`absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="lg:w-1/2 text-left">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {item.title}
                </h3>
                <Description
                  text={item.text}
                  points={item.points}
                />
              </div>
            </div>
          );
        })}
      </div>
    </BaseLayout>
  );
};

export default Excellence;
