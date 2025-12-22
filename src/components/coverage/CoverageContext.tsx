import React from 'react';
import type { Context } from '@/client/models/context';
import { formatDateTimeString } from '@/utils/dateUtils';

interface CoverageContextProps {
    context: Context;
}

const CoverageContext: React.FC<CoverageContextProps> = ({ context }) => {
    return (
        <div className='box mb-5'>
            <h2 className='title is-4 mb-4'>Contexte</h2>
            <div className='content'>
                {context.timezone && (
                    <p><strong>Fuseau horaire:</strong> {context.timezone}</p>
                )}
                {context.current_datetime && (
                    <p><strong>Date/heure actuelle:</strong> {formatDateTimeString(context.current_datetime)}</p>
                )}
                {context.car_direct_path && (
                    <div>
                        <strong>Chemin direct en voiture:</strong>
                        {context.car_direct_path.co2_emission && (
                            <p>CO₂: {context.car_direct_path.co2_emission.value} {context.car_direct_path.co2_emission.unit}</p>
                        )}
                        {context.car_direct_path.air_pollutants && (
                            <div>
                                <p>Polluants atmosphériques:</p>
                                <ul>
                                    {context.car_direct_path.air_pollutants.values?.nox !== undefined && (
                                        <li>NOx: {context.car_direct_path.air_pollutants.values.nox} {context.car_direct_path.air_pollutants.unit}</li>
                                    )}
                                    {context.car_direct_path.air_pollutants.values?.pm !== undefined && (
                                        <li>PM: {context.car_direct_path.air_pollutants.values.pm} {context.car_direct_path.air_pollutants.unit}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoverageContext;

