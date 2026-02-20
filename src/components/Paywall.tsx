import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useRevenueCat } from '@/contexts/RevenueCatContext';
import { PurchasesPackage } from '@revenuecat/purchases-js';

const Paywall: React.FC = () => {
  const { offerings, purchasePackage } = useRevenueCat();

  const handlePurchase = async (pack: PurchasesPackage) => {
    try {
      await purchasePackage(pack);
    } catch (error) {
      // Error is already logged in the context
    }
  };

  if (!offerings) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading offerings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Subscribe to Premium
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Unlock exclusive features by subscribing to our premium plan.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3, mt: 3 }}>
        {offerings.current?.availablePackages.map((pack) => (
          <Card key={pack.identifier} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {pack.product.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {pack.product.description}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ my: 2 }}>
                {pack.product.priceString}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handlePurchase(pack)}
                fullWidth
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Paywall;
