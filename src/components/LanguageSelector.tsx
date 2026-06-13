import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../data/languages';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 transition-colors duration-200"
        style={{
          padding: '6px 14px',
          border: '1px solid #222222',
          borderRadius: '6px',
          background: 'transparent',
          color: '#999999',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '0.8125rem',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E50914';
          (e.currentTarget as HTMLButtonElement).style.color = '#E50914';
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#222222';
            (e.currentTarget as HTMLButtonElement).style.color = '#999999';
          }
        }}
      >
        <span className="text-[1.25rem]">{currentLang.flag}</span>
        <span className="text-white">{currentLang.name}</span>
        <ChevronDown
          size={14}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 z-50 overflow-y-auto"
          style={{
            top: 'calc(100% + 6px)',
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '12px',
            padding: '0.75rem',
            minWidth: '220px',
            maxHeight: '360px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'langDropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {languages.map((lang) => {
            const isActive = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left transition-colors duration-150"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'rgba(229,9,20,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #E50914' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1A1A1A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="text-[1.25rem] shrink-0">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-[0.875rem] truncate"
                    style={{
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {lang.name}
                  </p>
                </div>
                {isActive && <Check size={16} style={{ color: '#E50914', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes langDropdownIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
