import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import type { Context } from '@/client/models/context';
import { formatDateTimeString } from '@/utils/dateUtils';

interface CoverageContextProps {
    context: Context;
}

const CoverageContext: React.FC<CoverageContextProps> = ({ context }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Contexte</Typography>
            {context.timezone && (
                <Typography><strong>Fuseau horaire:</strong> {context.timezone}</Typography>
            )}
            {context.current_datetime && (
                <Typography><strong>Date/heure actuelle:</strong> {formatDateTimeString(context.current_datetime)}</Typography>
            )}
            {context.car_direct_path && (
                <Box sx={{ mt: 1 }}>
                    <Typography fontWeight={600}>Chemin direct en voiture:</Typography>
                    {context.car_direct_path.co2_emission && (
                        <Typography>CO₂: {context.car_direct_path.co2_emission.value} {context.car_direct_path.co2_emission.unit}</Typography>
                    )}
                    {context.car_direct_path.air_pollutants && (
                        <Box>
                            <Typography>Polluants atmosphériques:</Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {context.car_direct_path.air_pollutants.values?.nox !== undefined && (
                                    <li>NOx: {context.car_direct_path.air_pollutants.values.nox} {context.car_direct_path.air_pollutants.unit}</li>
                                )}
                                {context.car_direct_path.air_pollutants.values?.pm !== undefined && (
                                    <li>PM: {context.car_direct_path.air_pollutants.values.pm} {context.car_direct_path.air_pollutants.unit}</li>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default CoverageContext;
