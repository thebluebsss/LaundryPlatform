import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAUNDRY_SERVICES, PROMO_CODES } from '../../data';
import { CartItem, PromoCode } from '../../types';
import { useToast } from '../../components/Toast';

export const useHome = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care'>('all');
  
  // Cart state stored as record of { serviceId: quantity }
  const [cart, setCart] = useState<Record<string, number>>(() => {
    // Check if there's any active booking draft in session
    const cached = sessionStorage.getItem('sachse_cart_draft');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CartItem[];
        const draft: Record<string, number> = {};
        parsed.forEach(item => {
          draft[item.serviceId] = item.quantity;
        });
        return draft;
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [activePromo, setActivePromo] = useState<PromoCode | undefined>(() => {
    const cached = sessionStorage.getItem('sachse_promo_draft');
    if (cached) {
      try {
        return JSON.parse(cached) as PromoCode;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  });

  const updateQuantity = (serviceId: string, delta: number) => {
    setCart(prev => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[serviceId];
      } else {
        updated[serviceId] = next;
      }
      return updated;
    });
  };

  const cartItemsList: CartItem[] = Object.entries(cart).map(([serviceId, qty]) => {
    const details = LAUNDRY_SERVICES.find(s => s.id === serviceId);
    if (!details) return null;
    return {
      serviceId,
      serviceName: details.name,
      quantity: qty,
      unitPrice: details.unitPrice,
      pricingType: details.pricingType,
      unitName: details.unitName
    };
  }).filter((item): item is CartItem => item !== null);

  const subtotal = cartItemsList.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const isFreeDelivery = subtotal >= 200000;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : 25000);

  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.minSubtotal && subtotal < activePromo.minSubtotal) {
      discountAmount = 0;
    } else {
      if (activePromo.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * activePromo.value) / 100);
      } else {
        discountAmount = activePromo.value;
      }
    }
  }

  const totalPrice = Math.max(0, subtotal + deliveryFee - discountAmount);

  const estDays = cartItemsList.length === 0 ? 1 : Math.max(...cartItemsList.map(item => {
    const details = LAUNDRY_SERVICES.find(s => s.id === item.serviceId);
    return details ? details.durationDays : 1;
  }));

  const handleApplyPromo = (code: string) => {
    const inputClean = code.trim().toUpperCase();
    const found = PROMO_CODES.find(p => p.code === inputClean);
    if (!found) {
      setPromoError('Mã này chưa được đăng ký hoặc đã hết hiệu lực.');
      setActivePromo(undefined);
      return;
    }

    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setPromoError(`Mã yêu cầu tổng hóa đơn giặt từ ${(found.minSubtotal).toLocaleString('vi-VN')}đ.`);
      setActivePromo(undefined);
      return;
    }

    setPromoError('');
    setActivePromo(found);
    setPromoInput(found.code);
  };

  const handleProceedToBooking = () => {
    if (cartItemsList.length === 0) {
      showToast('Vui lòng chọn hoặc ước tính khối lượng giặt là trước khi đặt lịch nhé!', 'warning');
      return;
    }
    sessionStorage.setItem('sachse_cart_draft', JSON.stringify(cartItemsList));
    if (activePromo) {
      sessionStorage.setItem('sachse_promo_draft', JSON.stringify(activePromo));
    } else {
      sessionStorage.removeItem('sachse_promo_draft');
    }
    navigate('/booking');
  };

  return {
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
  };
};
