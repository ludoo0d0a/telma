import React from 'react';
import { Box, Typography } from '@mui/material';

const PremiumPage: React.FC = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Premium Content!
      </Typography>
      <Typography>
        This is an exclusive feature available only to our subscribed users. Thank you for your support!
      </Typography>
    </Box>
  );
};

export default PremiumPage;
