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
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-3">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-blue-600">
            Minh bạch & rõ ràng
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Bảng giá dịch vụ & câu hỏi thường gặp
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            Đơn giá niêm yết công khai theo kg hoặc theo món. Tiệm cân thực tế
            và gửi bạn duyệt chi phí trước khi bắt đầu giặt, không phát sinh phụ
            phí ngoài thỏa thuận.
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
