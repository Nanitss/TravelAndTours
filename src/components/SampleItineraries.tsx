import React from 'react';
import './SampleItineraries.css';

const SampleItineraries: React.FC = () => {
  const sampleItineraries = [
    {
      id: 1,
      title: '5 Days in Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2094&q=80',
      description: 'Vibrant city life with ancient traditions and modern innovation'
    },
    {
      id: 2,
      title: '2 Days in Nara, Japan',
      image: '/assets/Nara.jpg',
      description: 'Ancient capital with friendly deer and historic temples'
    },
    {
      id: 3,
      title: '3 Days in Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Ancient temples, traditional gardens, and authentic Japanese culture'
    }
  ];

  return (
    <section className="sample-itineraries">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Japan Travel Itineraries</h2>
          <p className="section-subtitle">
            Discover the best of Japan with our carefully crafted sample itineraries showcasing the country's most iconic destinations.
          </p>
        </div>

        <div className="itinerary-cards">
          {sampleItineraries.map((itinerary) => (
            <div key={itinerary.id} className="itinerary-card">
              <div 
                className="card-image"
                style={{ 
                  backgroundImage: `url(${itinerary.image})`,
                  backgroundColor: '#f0f0f0'
                }}
              >
                <div className="image-overlay">
                  <h3 className="card-title">{itinerary.title}</h3>
                </div>
              </div>
              <div className="card-content">
                <p className="card-description">{itinerary.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SampleItineraries;
