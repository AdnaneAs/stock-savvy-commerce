
import React, { createContext, useContext, useState, useCallback } from 'react';
import { currencies, Currency, formatCurrency } from '@/config/currencies';

type CurrencyContextType = {
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]);

  const setCurrency = useCallback((code: string) => {
    const newCurrency = currencies.find(curr => curr.code === code);
    if (newCurrency) {
      setCurrentCurrency(newCurrency);
      localStorage.setItem('preferredCurrency', code);
    }
  }, []);

  const format = useCallback((amount: number): string => {
    return formatCurrency(amount, currentCurrency);
  }, [currentCurrency]);

  return (
    <CurrencyContext.Provider value={{ currentCurrency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
