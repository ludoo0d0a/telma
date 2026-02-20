import React from 'react';
import { Box, Typography } from '@mui/material';
import packageJson from '../../package.json';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        px: 2,
        textAlign: 'center',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="inherit">
        &copy; {new Date().getFullYear()} SNCF API Explorer
      </Typography>
      <Typography variant="caption" color="inherit" display="block" sx={{ mt: 0.5 }}>
        Powered by Navitia API
      </Typography>
      <Typography variant="caption" color="inherit" display="block" sx={{ mt: 0.5 }}>
        Version {packageJson.version}
      </Typography>
    </Box>
  );
};

export default Footer;
