import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Languages, Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import log from "../etc/utils";

const LANGUAGES = [
  { code: "en", name: "English", label: "EN" },
  { code: "ru", name: "Русский", label: "RU" },
  { code: "ja", name: "日本語", label: "JA" },
  { code: "ko", name: "한국어", label: "KO" },
  { code: "es", name: "Español", label: "ES" },
  { code: "zh", name: "中文", label: "ZH" },
  { code: "fr", name: "Français", label: "FR" },
  { code: "de", name: "Deutsch", label: "DE" },
  { code: "pt", name: "Português", label: "PT" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  log.v("Navbar component rendered");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    log.d("Language changed to:", code);
  };

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language.split("-")[0]) ||
    LANGUAGES[0];

  return (
    <nav className="sticky top-0 z-50 px-8 py-3 bg-brand-bg/80 backdrop-blur-xl border-b border-white/10">
      <div className="container flex justify-between items-center !px-0">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="bg-brand-primary p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <PlayCircle size={24} className="text-brand-bg" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
            {t("common.app_name")}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/videos"
            className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity no-underline"
          >
            {t("videos.nav_link", "Videos")}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium group"
            >
              <Languages
                size={18}
                className="text-brand-primary opacity-70 group-hover:opacity-100"
              />
              <span className="min-w-[24px]">{currentLang.label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-[60] animate-fade">
                <div className="py-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{lang.name}</span>
                      </div>
                      {currentLang.code === lang.code && (
                        <Check size={16} className="text-brand-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
