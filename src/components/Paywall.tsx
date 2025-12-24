
import React from 'react';
import { useRevenueCat } from '@/contexts/RevenueCatContext';
import { PurchasesPackage } from '@revenuecat/purchases-js';

const Paywall: React.FC = () => {
  const { offerings, purchasePackage } = useRevenueCat();

  const handlePurchase = async (pack: PurchasesPackage) => {
    try {
      await purchasePackage(pack);
      // Optionally, you can handle the successful purchase here,
      // e.g., show a confirmation message, redirect, etc.
    } catch (error) {
      // Error is already logged in the context, but you can handle it here too
    }
  };

  if (!offerings) {
    return <div>Loading offerings...</div>;
  }

  return (
    <div className="paywall-container">
      <h2>Subscribe to Premium</h2>
      <p>Unlock exclusive features by subscribing to our premium plan.</p>
      <div className="packages-container">
        {offerings.current?.availablePackages.map((pack) => (
          <div key={pack.identifier} className="package-card">
            <h3>{pack.product.title}</h3>
            <p>{pack.product.description}</p>
            <p className="price">{pack.product.priceString}</p>
            <button onClick={() => handlePurchase(pack)}>
              Subscribe
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .paywall-container {
          padding: 2rem;
          text-align: center;
        }
        .packages-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }
        .package-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          width: 300px;
        }
        .price {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Paywall;
