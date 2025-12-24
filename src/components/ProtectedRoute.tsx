
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

const ProtectedRoute: React.FC = () => {
  const { customerInfo } = useRevenueCat();

  // This is a placeholder for your premium entitlement identifier
  const PREMIUM_ENTITLEMENT_ID = 'premium';

  if (customerInfo === null) {
    // Customer info is still loading, you might want to show a loader here
    return <div>Loading...</div>;
  }

  const isSubscribed = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

  return isSubscribed ? <Outlet /> : <Navigate to="/paywall" replace />;
};

export default ProtectedRoute;
