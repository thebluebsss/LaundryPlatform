import React from 'react';
import { usePriceInfo } from './hook';
import { PriceList } from './components/PriceList';
import { FAQCollapse } from './components/FAQCollapse';

export const PriceInfo: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedFAQ,
    toggleFAQ,
    filteredServices,
    faqs
  } = usePriceInfo();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Intro section banner */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="max-w-2xl">
          <span className="text-[10px] md:text-xs font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Minh Bạch & Tận Tâm
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-3">
            Bảng Giá Dịch Vụ Công Khai & Câu Hỏi Thường Gặp
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-normal mt-2">
            Không phụ phí phát sinh bừa bãi. Chi phí được tính chuẩn xác theo trọng lượng kilogram hoặc số lượng chiếc đăng ký ban đầu. Yên tâm trao gửi - an tâm giặt giũ.
          </p>
        </div>
      </section>

      {/* Pricing Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Price Table Area (7 cols) */}
        <div className="lg:col-span-7">
          <PriceList
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredServices={filteredServices}
          />
        </div>

        {/* FAQs list (5 cols) */}
        <div className="lg:col-span-5">
          <FAQCollapse
            faqs={faqs}
            expandedFAQ={expandedFAQ}
            toggleFAQ={toggleFAQ}
          />
        </div>

      </div>
    </div>
  );
};
