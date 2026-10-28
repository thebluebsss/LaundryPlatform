import React from 'react';
import { useHome } from './hook';
import { HeroSection } from './components/HeroSection';
import { Estimator } from './components/Estimator';
import { CartSummary } from './components/CartSummary';

export const Home: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    cart,
    updateQuantity,
    cartItemsList,
    subtotal,
    isFreeDelivery,
    deliveryFee,
    promoInput,
    setPromoInput,
    promoError,
    setPromoError,
    activePromo,
    discountAmount,
    totalPrice,
    estDays,
    handleApplyPromo,
    handleProceedToBooking
  } = useHome();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Area */}
      <HeroSection />

      {/* Estimator Section Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Services Select Block column (8cols) */}
        <div className="lg:col-span-8">
          <Estimator
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            cart={cart}
            updateQuantity={updateQuantity}
          />
        </div>

        {/* Invoice Summary Box columns (4cols) */}
        <div className="lg:col-span-4">
          <CartSummary
            cartItemsList={cartItemsList}
            subtotal={subtotal}
            isFreeDelivery={isFreeDelivery}
            deliveryFee={deliveryFee}
            activePromo={activePromo}
            discountAmount={discountAmount}
            estDays={estDays}
            totalPrice={totalPrice}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            promoError={promoError}
            setPromoError={setPromoError}
            handleApplyPromo={handleApplyPromo}
            handleProceedToBooking={handleProceedToBooking}
          />
        </div>
      </div>
    </div>
  );
};
