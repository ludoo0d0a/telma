import React from 'react';
import { Link } from 'react-router-dom';

interface TrainCardProps {
    city: string;
}

const TrainCard: React.FC<TrainCardProps> = ({ city }) => {
    return (
        <Link to={`/city/${city.toLowerCase()}`} className='train-card-wrapper'>
            <div className='card train-card-item'>
                <div className='card-content'>
                    <div className='media'>
                        <div className='media-left'>
                            <span className='icon is-medium has-text-primary'>
                                <i className='fas fa-train fa-2x'></i>
                            </span>
                        </div>
                        <div className='media-content'>
                            <p className='title is-5 mb-1'>{city}</p>
                            <p className='subtitle is-7'>View station schedules</p>
                        </div>
                        <div className='media-right'>
                            <span className='icon has-text-grey-light'>
                                <i className='fas fa-chevron-right'></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TrainCard;
