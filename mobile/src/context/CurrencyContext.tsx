import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyCode = 'USD' | 'KES' | 'UGX' | 'TZS';

export const CURRENCIES: Record<CurrencyCode, { label: string; symbol: string; rate: number; decimals: number }> = {
  USD: { label: 'US Dollar ($)',           symbol: '$',    rate: 1,    decimals: 2 },
  KES: { label: 'Kenyan Shilling (KSh)',   symbol: 'KSh ', rate: 130,  decimals: 0 },
  UGX: { label: 'Ugandan Shilling (USh)',  symbol: 'USh ', rate: 3750, decimals: 0 },
  TZS: { label: 'Tanzanian Shilling (TSh)',symbol: 'TSh ', rate: 2700, decimals: 0 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'app_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored && stored in CURRENCIES) {
        setCurrencyState(stored as CurrencyCode);
      }
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    AsyncStorage.setItem(STORAGE_KEY, code);
  };

  const fmt = (amount: number): string => {
    const { symbol, rate, decimals } = CURRENCIES[currency];
    const converted = amount * rate;
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
};
