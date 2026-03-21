import { CreditCard, Clock, Wallet, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import BaseLayout from "../layout/base";
import SectionHeader from "./ui/section_header";
import { useTranslation } from "react-i18next";

const DISABLED_INDEXES = [2]; // EPP card (index 2) is temporarily disabled

export default function PaymentMethods() {
    const { t } = useTranslation();

    const styleConfigs = [
        { icon: Wallet, color: "red", gradient: "from-red-400 to-rose-500", bgGradient: "from-red-50 to-rose-50", border: "border-red-200", iconBg: "bg-red-500" },
        { icon: CreditCard, color: "emerald", gradient: "from-emerald-400 to-teal-500", bgGradient: "from-emerald-50 to-teal-50", border: "border-emerald-200", iconBg: "bg-emerald-500" },
        { icon: Clock, color: "blue", gradient: "from-blue-400 to-indigo-500", bgGradient: "from-blue-50 to-indigo-50", border: "border-blue-200", iconBg: "bg-blue-500" },
    ];

    const defaultStyle = { icon: Wallet, color: "slate", gradient: "from-slate-400 to-slate-500", bgGradient: "from-slate-50 to-slate-100", border: "border-slate-200", iconBg: "bg-slate-500" };

    const itemsData = t("paymentMethods.items", { returnObjects: true });
    const paymentMethods = (Array.isArray(itemsData) ? itemsData : []).map(
        (method: any, index: number) => {
            const style = styleConfigs[index] || defaultStyle;
            return {
                ...method,
                icon: style.icon,
                color: style.color,
                gradient: style.gradient,
                bgGradient: style.bgGradient,
                borderColor: style.border,
                iconBg: style.iconBg,
                disabled: DISABLED_INDEXES.includes(index),
            };
        }
    );

    return (
        <BaseLayout className="flex-col pt-4 pb-16">
            <SectionHeader
                badge={t("paymentMethods.badge")}
                title={t("paymentMethods.title")}
                subtitle={t("paymentMethods.subtitle")}
            />

            {/* Cards */}
            <div className="w-full grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {paymentMethods.map((method, index) => {
                    const Icon = method.icon;
                    const isDisabled = method.disabled;
                    return (
                        <div
                            key={index}
                            className={`relative group rounded-2xl bg-gradient-to-br ${method.bgGradient} border ${method.borderColor} p-6 transition-all duration-300 flex flex-col ${isDisabled ? "opacity-60 grayscale pointer-events-none select-none" : "hover:shadow-xl hover:-translate-y-2"}`}
                        >
                            {/* Header: Icon + Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`w-12 h-12 rounded-xl ${method.iconBg} flex items-center justify-center shadow-lg ${isDisabled ? "" : "group-hover:scale-110"} transition-transform duration-300 flex-shrink-0`}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                        {method.title}
                                    </h3>
                                    <p className={`text-sm font-medium text-${method.color}-600`}>
                                        {method.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-left text-slate-600 text-sm mb-4 leading-relaxed whitespace-pre-line">
                                {method.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-2 mb-6 flex-1">
                                {(method.features || []).map((feature: string, i: number) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-full bg-gradient-to-r ${method.gradient} flex items-center justify-center flex-shrink-0`}
                                        >
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            {isDisabled ? (
                                <div className="block w-full text-center py-3 rounded-xl bg-slate-300 text-slate-500 font-semibold cursor-not-allowed">
                                    {method.cta}
                                </div>
                            ) : (
                                <Link
                                    to="/register"
                                    className={`block w-full text-center py-3 rounded-xl bg-gradient-to-r ${method.gradient} text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90`}
                                >
                                    {method.cta}
                                </Link>
                            )}

                            {/* Decorative element */}
                            <div
                                className={`absolute -z-10 top-4 right-4 w-24 h-24 rounded-full bg-gradient-to-r ${method.gradient} opacity-10 blur-2xl ${isDisabled ? "" : "group-hover:opacity-20"} transition-opacity duration-300`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Bottom note */}
            <div className="w-full max-w-3xl mx-auto mt-12 text-center">
                <p className="text-slate-500 text-sm">
                    💡 {t("paymentMethods.note")}
                </p>
            </div>
        </BaseLayout>
    );
}
