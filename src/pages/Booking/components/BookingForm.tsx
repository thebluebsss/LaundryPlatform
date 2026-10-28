import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import { DISTRICTS } from '../../../data';
import { InputText } from '../../../components/InputText';
import { InputSelect } from '../../../components/InputSelect';
import { InputArea } from '../../../components/InputArea';
import { Box } from '@mui/material';

interface BookingFormProps {
  fullname: string;
  setFullname: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  city: 'hanoi' | 'hcm';
  setCity: (val: 'hanoi' | 'hcm') => void;
  district: string;
  setDistrict: (val: string) => void;
  addressDetail: string;
  setAddressDetail: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  pickupDateStr: string;
  setPickupDateStr: (val: string) => void;
  pickupTimeSlot: string;
  setPickupTimeSlot: (val: string) => void;
  deliveryDateStr: string;
  setDeliveryDateStr: (val: string) => void;
  deliveryTimeSlot: string;
  setDeliveryTimeSlot: (val: string) => void;
  errors: Record<string, string>;
  timeSlots: string[];
}

export const BookingForm: React.FC<BookingFormProps> = ({
  fullname,
  setFullname,
  phoneNumber,
  setPhoneNumber,
  city,
  setCity,
  district,
  setDistrict,
  addressDetail,
  setAddressDetail,
  notes,
  setNotes,
  pickupDateStr,
  setPickupDateStr,
  pickupTimeSlot,
  setPickupTimeSlot,
  deliveryDateStr,
  setDeliveryDateStr,
  deliveryTimeSlot,
  setDeliveryTimeSlot,
  errors,
  timeSlots
}) => {
  return (
    <Box className="flex flex-col gap-8">
      {/* Section 1: Customer info */}
      <Box className="flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0 select-none">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          1. Thông tin liên hệ nhận hàng
        </h3>
        
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            title="Họ & Tên khách hàng *"
            placeholder="Nguyễn Văn A"
            startAdornment={<User style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
            inputProps={{
              value: fullname,
              onChange: (e: any) => setFullname(e.target.value),
            }}
            inputError={errors.fullname}
          />

          <InputText
            title="Số điện thoại di động *"
            placeholder="0912345678"
            startAdornment={<Phone style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
            inputProps={{
              value: phoneNumber,
              onChange: (e: any) => setPhoneNumber(e.target.value),
            }}
            inputError={errors.phone}
          />
        </Box>
      </Box>

      {/* Section 2: Address */}
      <Box className="flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0 select-none">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          2. Khu vực giao nhận hàng
        </h3>

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputSelect
            title="Thành phố *"
            value={city}
            onChange={(e) => {
              const newCity = e.target.value as 'hanoi' | 'hcm';
              setCity(newCity);
              setDistrict(DISTRICTS[newCity][0]);
            }}
            options={[
              { value: 'hanoi', label: 'Hà Nội' },
              { value: 'hcm', label: 'TP. Hồ Chí Minh' }
            ]}
          />

          <Box className="md:col-span-2">
            <InputSelect
              title="Quận / Huyện *"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              options={
                city === 'hanoi' 
                  ? DISTRICTS.hanoi.map(d => ({ value: d, label: d }))
                  : DISTRICTS.hcm.map(d => ({ value: d, label: d }))
              }
            />
          </Box>
        </Box>

        <InputText
          title="Địa chỉ chi tiết (Số nhà, ngõ ngách, tên đường) *"
          placeholder="Ví dụ: Số 25, Ngõ 102 Đường Kim Mã"
          startAdornment={<MapPin style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
          inputProps={{
            value: addressDetail,
            onChange: (e: any) => setAddressDetail(e.target.value),
          }}
          inputError={errors.addressDetail}
        />
      </Box>

      {/* Section 3: Time Booking */}
      <Box className="flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0 select-none">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          3. Chọn ngày & giờ giao nhận hàng
        </h3>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Strip */}
          <Box className="p-5 border border-blue-100/80 bg-blue-50/10 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-blue-200/80 hover:bg-blue-50/20 shadow-sm shadow-blue-100/10">
            <Box className="flex items-center gap-2 pb-3 border-b border-blue-100/40">
              <span className="w-2 h-2 rounded-full inline-block bg-blue-600" />
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Hẹn thu nhận quần áo tại nhà
              </span>
            </Box>
            
            <InputText
              title="Ngày thu gom"
              inputProps={{
                type: 'date',
                value: pickupDateStr,
                min: new Date().toISOString().split('T')[0],
                onChange: (e: any) => setPickupDateStr(e.target.value),
              }}
              inputError={errors.pickupDate}
            />

            <InputSelect
              title="Giờ vàng thu gom:"
              value={pickupTimeSlot}
              onChange={(e) => setPickupTimeSlot(e.target.value)}
              options={timeSlots.map(slot => ({ value: slot, label: slot }))}
            />
          </Box>

          {/* Delivery Strip */}
          <Box className="p-5 border border-indigo-100/80 bg-indigo-50/10 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-indigo-200/80 hover:bg-indigo-50/20 shadow-sm shadow-indigo-100/10">
            <Box className="flex items-center gap-2 pb-3 border-b border-indigo-100/40">
              <span className="w-2 h-2 rounded-full inline-block bg-indigo-600" />
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Hẹn hoàn trả đồ sạch gấp phẳng
              </span>
            </Box>

            <InputText
              title="Ngày giao đồ"
              inputProps={{
                type: 'date',
                value: deliveryDateStr,
                min: pickupDateStr || new Date().toISOString().split('T')[0],
                onChange: (e: any) => setDeliveryDateStr(e.target.value),
              }}
              inputError={errors.deliveryDate}
            />

            <InputSelect
              title="Khung giờ giao hàng:"
              value={deliveryTimeSlot}
              onChange={(e) => setDeliveryTimeSlot(e.target.value)}
              options={timeSlots.map(slot => ({ value: slot, label: slot }))}
            />
          </Box>
        </Box>
      </Box>

      {/* Section 4: Notes */}
      <InputArea
        title="4. Ghi chú đặc biệt gửi thợ giặt"
        placeholder="Ví dụ: Đồ màu loang có vết dầu mỡ lớn cần tẩy điểm ở gấu quần, hoặc treo móc thay vì gấp xếp..."
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Box>
  );
};
