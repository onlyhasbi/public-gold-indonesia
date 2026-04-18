import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";

import { requireGuest } from "../lib/auth";
import { PortalGate } from "../components/auth/PortalGate";
import { SignInForm } from "../components/auth/SignInForm";
import { SignUpForm } from "../components/auth/SignUpForm";
import { isUnlockedAtom, lockoutExpiryAtom } from "../store/portalStore";

const MotionCard = motion.create(Card);

export const Route = createFileRoute("/")({
  beforeLoad: () => requireGuest(),
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode?: "signin" | "signup" } => {
    return {
      mode: (search.mode as "signin" | "signup") || undefined,
    };
  },
  component: LandingAuthPage,
});

function LandingAuthPage() {
  const { mode } = useSearch({ from: "/" });

  const isUnlocked = useAtomValue(isUnlockedAtom);
  const lockoutExpiry = useAtomValue(lockoutExpiryAtom);
  const lockoutTime =
    lockoutExpiry && lockoutExpiry > Date.now() ? lockoutExpiry : 0;

  const [authMode, setAuthMode] = useState<"signin" | "signup">(
    mode || "signin",
  );

  useEffect(() => {
    if (mode) setAuthMode(mode);
  }, [mode]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 overflow-hidden px-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-50/50 via-slate-50 to-slate-50 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-8 md:gap-10"
      >
        <AnimatePresence>
          {!lockoutTime && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center gap-4 lg:gap-6 w-full max-w-lg mb-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-3 bg-[#000856] rounded-2xl shadow-sm border border-slate-100"
              >
                <img
                  src="https://mypublicgold.com/5g/logo/logo_gold.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <PortalGate key="secret-gate" />
          ) : (
            <MotionCard
              key="auth-content"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 border-none ring-0 max-w-lg mx-auto w-full"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <Tabs
                  value={authMode}
                  onValueChange={(v) => setAuthMode(v as "signin" | "signup")}
                  className="w-full"
                >
                  <div className="flex justify-center mb-4 pt-4">
                    <TabsList
                      variant="line"
                      className="flex bg-transparent border-none h-auto p-0 gap-8"
                    >
                      <TabsTrigger
                        value="signin"
                        className="font-bold rounded-none border-none py-3 text-xs transition-all px-2 text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:after:!bg-slate-900"
                      >
                        Masuk
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="font-bold rounded-none border-none py-3 text-xs transition-all px-2 text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:after:!bg-slate-900"
                      >
                        Daftar
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="p-6 sm:px-10 pb-8 pt-0">
                    <AnimatePresence mode="wait">
                      <TabsContent value="signin" className="mt-0 outline-none">
                        <SignInForm />
                      </TabsContent>
                      <TabsContent value="signup" className="mt-0 outline-none">
                        <SignUpForm
                          onSignupSuccess={() => setAuthMode("signin")}
                        />
                      </TabsContent>
                    </AnimatePresence>
                  </div>
                </Tabs>
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-50 flex flex-col items-center gap-3 bg-transparent">
                  <a
                    href="https://wa.me/628979901844"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 bg-emerald-50 rounded-full">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-[9px] text-slate-400 tracking-wider">
                      Butuh Bantuan? Hubungi Admin
                    </span>
                  </a>
                  <div className="flex items-center gap-3 text-[9px] text-slate-300">
                    <Link
                      to="/legal"
                      search={{ tab: "terms" }}
                      className="hover:text-slate-500 transition-colors no-underline"
                    >
                      Syarat & Ketentuan
                    </Link>
                    <span>•</span>
                    <Link
                      to="/legal"
                      search={{ tab: "privacy" }}
                      className="hover:text-slate-500 transition-colors no-underline"
                    >
                      Privasi
                    </Link>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!lockoutTime && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 mt-4"
            >
              <div className="flex items-center justify-center gap-2 opacity-30 text-[9px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Portal
                Keamanan Terpusat Public Gold
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-300 opacity-40">
                <Link
                  to="/legal"
                  search={{ tab: "terms" }}
                  className="hover:text-slate-500 transition-colors no-underline"
                >
                  Syarat & Ketentuan
                </Link>
                <span>•</span>
                <Link
                  to="/legal"
                  search={{ tab: "privacy" }}
                  className="hover:text-slate-500 transition-colors no-underline"
                >
                  Privasi
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
