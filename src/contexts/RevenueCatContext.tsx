
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-js';
import * as Purchases from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  useEffect(() => {
    if (user) {
      // IMPORTANT: Replace with your actual RevenueCat API key from your environment variables
      const REVENUECAT_API_KEY = process.env.VITE_REVENUECAT_PUBLIC_API_KEY || 'your_revenuecat_api_key';
      Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserId: user.sub });

      const customerInfoUpdateListener = (info: CustomerInfo) => {
        setCustomerInfo(info);
      };

      Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);


      Purchases.getOfferings().then((offerings) => {
        setOfferings(offerings);
      });

      return () => {
          Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
      }
    }
  }, [user]);

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      await Purchases.purchasePackage(pack);
    } catch (e) {
      console.error("Purchase failed:", e);
      // Handle error accordingly
    }
  };

  return (
    <RevenueCatContext.Provider value={{ customerInfo, offerings, purchasePackage }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};
