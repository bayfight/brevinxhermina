'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Temukan opsi terpilih saat ini
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown ketika pengguna mengklik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fokuskan input box pencarian saat dropdown terbuka
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input untuk mendukung validasi form bawaan HTML5 */}
      <input
        type="text"
        id={id}
        value={value}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        className="opacity-0 pointer-events-none absolute inset-0 w-full h-full"
      />

      {/* Tombol Dropdown */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
            : 'text-gray-800 hover:border-gray-400 cursor-pointer shadow-sm active:scale-[0.99]'
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover List Opsi */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col transition-all duration-200 origin-top">
          {/* Input Pencarian */}
          <div className="flex items-center px-3 py-2 border-b border-gray-100 bg-gray-50">
            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Opsi yang Terfilter */}
          <div className="overflow-y-auto flex-1 max-h-48 py-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
