import { useState, useContext, createContext, FC, ReactNode } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

type LoadingContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

type LoadingProps = {
  children: ReactNode;
};

const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {}
});

/**
 * @return useContext use context loading
 */
export function useLoading(): LoadingContextType {
  return useContext(LoadingContext);
}

/**
 * @return LoadingProvider provider value loading
 */
export const LoadingProvider: FC<LoadingProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const value = { loading, setLoading };
  return (
    <LoadingContext.Provider value={value}>
      {loading && (
        <Backdrop
          sx={{
            color: '#fff',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999
          }}
          open
        >
          <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <CircularProgress color="primary" size={40} thickness={4} />
            <span className="text-sm font-medium text-slate-700 animate-pulse font-sans">
              Đang tải dữ liệu...
            </span>
          </div>
        </Backdrop>
      )}
      {children}
    </LoadingContext.Provider>
  );
};
