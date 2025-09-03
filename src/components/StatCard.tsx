// StatCard.tsx
import React from "react";

/**
 * Props:
 * - bgHex: exact background color (hex)
 * - icon: PrimeIcons class (e.g. "pi pi-users")
 * - value: main numeric/string value
 * - label: sublabel text
 * - delta: string like "+%23" | "-%23"
 * - deltaDirection: "up" | "down"
 * - accentHex: color for the delta text when positive (match screenshot)
 */
type StatCardProps = {
    bgHex: string;
    icon: string;
    value: string;
    label: string;
    delta?: string;
    deltaDirection?: "up" | "down";
    accentHex?: string;
    emptyState?: boolean; // when true, show only title + subtitle (pink card)
    title?: string;
    subtitle?: string;
};

const StatCard: React.FC<StatCardProps> = ({
    bgHex,
    icon,
    value,
    label,
    delta,
    deltaDirection = "up",
    accentHex = "#2563EB", // Tailwind blue-600-ish (for +%23)
    emptyState = false,
    title,
    subtitle,
}) => {
    return (
        <div
            className="w-[448px] h-[144px] rounded-2xl flex items-center px-6"
            style={{ backgroundColor: bgHex }}
        >
            {/* Left icon circle */}
            <div className="flex items-center">
                <div className="w-11 h-11 rounded-full bg-white/40 flex items-center justify-center">
                    <i className={`${icon} text-[20px] text-black/60`} />
                </div>
            </div>

            {/* Text area */}
            <div className="flex-1 ml-4">
                {emptyState ? (
                    <>
                        <div className="text-[20px] font-semibold text-[#0A0A0A]">
                            {title}
                        </div>
                        <div className="text-[14px] text-[#6B7280]">
                            {subtitle}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-[28px] font-semibold tracking-tight text-[#0A0A0A]">
                            {value}
                        </div>
                        <div className="text-[14px] text-[#6B7280] -mt-[2px]">
                            <div className="flex items-center gap-2">
                                <div>
                                    {label}
                                </div>

                                {!emptyState && delta && (
                                    <>
                                        <div className="w-7 h-7 rounded-full bg-[#0F172A] flex items-center justify-center">
                                            {deltaDirection === "up" ? (
                                                <i className="pi pi-arrow-up-right text-white text-[12px]" />
                                            ) : (
                                                <i className="pi pi-arrow-down-right text-white text-[12px]" />
                                            )}
                                        </div>
                                        <div
                                            className="text-[14px] font-medium"
                                            style={{ color: deltaDirection === "up" ? accentHex : "#6B7280" }}
                                        >
                                            {delta}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>


        </div>
    );
};

export default StatCard;
