import { info } from "../constant/baseInfo";
import BaseLayout from "../layout/base";
import SectionHeader from "./ui/section_header";
import {
  ShieldCheck,
  Smartphone,
  Truck,
  Archive,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function PublicGold() {
  const { t } = useTranslation();

  const iconMap = [ShieldCheck, Smartphone, Truck, Archive, TrendingDown, RefreshCw];

  const featuresData = t("publicGold.features", { returnObjects: true });
  const features = (Array.isArray(featuresData) ? featuresData : []).map(
    (feature: any, index: number) => ({
      ...feature,
      icon: iconMap[index] || ShieldCheck,
    })
  );

  return (
    <BaseLayout className="flex-col">
      <div className="w-full">
        <SectionHeader
          badge={t("publicGold.whyTitle")}
          title={t("publicGold.title")}
        />

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-10 items-center mb-16">
          <div className="lg:w-1/2">
            <img
              src="./public_gold_hero.webp"
              alt="Public Gold"
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div className="lg:w-1/2 text-left">
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {t("publicGold.desc")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("publicGold.stats.years"), value: info.tahunBeroperasi },
                { label: t("publicGold.stats.customers"), value: info.nasabah },
                { label: t("publicGold.stats.branches"), value: info.cabang.total },
                { label: t("publicGold.statsLabels.country"), value: info.negara },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="text-4xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                    {item.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex gap-4 items-start bg-white border border-slate-200 p-5 rounded-xl hover:shadow-lg hover:border-red-200 transition-all duration-300 group cursor-pointer"
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </span>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1" dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseLayout>
  );
}

export default PublicGold;
