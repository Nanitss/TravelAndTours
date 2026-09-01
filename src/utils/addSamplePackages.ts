import { TourService } from './supabaseService';

export interface PackageData {
  title: string;
  destination: string;
  description: string;
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  availabilityUntil: string;
  imageUrl: string;
  isActive: boolean;
  maxParticipants: number;
  highlights: string[];
  included: string[];
  itinerary: string[];
}

const samplePackages: PackageData[] = [
  {
    title: "Tokyo Cultural Discovery",
    destination: "Tokyo, Japan",
    description: "Immerse yourself in Tokyo's vibrant culture with visits to ancient temples, modern districts, and traditional experiences. Perfect for first-time visitors to Japan.",
    duration: 5,
    price: 66000,
    startDate: "2025-03-15",
    endDate: "2025-03-19",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/tokyo.jpg",
    isActive: true,
    maxParticipants: 12,
    highlights: [
      "Senso-ji Temple in Asakusa",
      "Shibuya Crossing experience",
      "Traditional tea ceremony",
      "Tsukiji Fish Market tour",
      "Tokyo Skytree observation deck"
    ],
    included: [
      "4 nights accommodation in 4-star hotel",
      "Daily breakfast",
      "All transportation within Tokyo",
      "Professional English-speaking guide",
      "Entrance fees to all attractions",
      "Traditional kaiseki dinner"
    ],
    itinerary: [
      "Day 1: Arrival, Asakusa Temple, Tokyo Skytree",
      "Day 2: Tsukiji Market, Ginza shopping, Imperial Palace",
      "Day 3: Shibuya, Harajuku, Meiji Shrine",
      "Day 4: Day trip to Nikko or Kamakura",
      "Day 5: Final shopping, departure"
    ]
  },
  {
    title: "Kyoto Heritage Tour",
    destination: "Kyoto, Japan",
    description: "Discover Japan's ancient capital with its stunning temples, traditional gardens, and preserved geisha districts. A journey through Japan's rich cultural heritage.",
    duration: 4,
    price: 53900,
    startDate: "2025-04-10",
    endDate: "2025-04-13",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/kyoto.jpg",
    isActive: true,
    maxParticipants: 10,
    highlights: [
      "Fushimi Inari Shrine with thousands of torii gates",
      "Kinkaku-ji (Golden Pavilion)",
      "Arashiyama Bamboo Grove",
      "Gion District geisha spotting",
      "Traditional ryokan stay"
    ],
    included: [
      "3 nights accommodation (2 nights hotel, 1 night ryokan)",
      "All meals included",
      "Private transportation",
      "Professional guide",
      "All temple entrance fees",
      "Traditional kaiseki dinner"
    ],
    itinerary: [
      "Day 1: Arrival, Fushimi Inari, Gion District",
      "Day 2: Kinkaku-ji, Ryoan-ji, Nijo Castle",
      "Day 3: Arashiyama, Bamboo Grove, Monkey Park",
      "Day 4: Free time, departure"
    ]
  },
  {
    title: "Osaka Food & Culture Adventure",
    destination: "Osaka, Japan",
    description: "Experience Japan's food capital with its incredible street food, vibrant nightlife, and historical sites. Perfect for food lovers and culture enthusiasts.",
    duration: 3,
    price: 41250,
    startDate: "2025-05-20",
    endDate: "2025-05-22",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/osaka.jpg",
    isActive: true,
    maxParticipants: 15,
    highlights: [
      "Dotonbori street food tour",
      "Osaka Castle exploration",
      "Universal Studios Japan",
      "Umeda Sky Building",
      "Traditional takoyaki making class"
    ],
    included: [
      "2 nights accommodation in central Osaka",
      "Daily breakfast",
      "Food tour with tastings",
      "Osaka Castle entrance",
      "Transportation pass",
      "Professional guide"
    ],
    itinerary: [
      "Day 1: Arrival, Dotonbori food tour, Umeda Sky Building",
      "Day 2: Osaka Castle, Universal Studios Japan",
      "Day 3: Takoyaki class, shopping, departure"
    ]
  },
  {
    title: "Nara Deer Park & Temples",
    destination: "Nara, Japan",
    description: "Visit Japan's first permanent capital and interact with friendly deer in Nara Park while exploring ancient temples and traditional architecture.",
    duration: 2,
    price: 24750,
    startDate: "2025-06-05",
    endDate: "2025-06-06",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/Nara.jpg",
    isActive: true,
    maxParticipants: 8,
    highlights: [
      "Nara Park deer feeding",
      "Todai-ji Temple with Great Buddha",
      "Kasuga Taisha Shrine",
      "Naramachi traditional district",
      "Traditional mochi making"
    ],
    included: [
      "1 night accommodation",
      "All meals",
      "Deer crackers",
      "Temple entrance fees",
      "Professional guide",
      "Transportation from Kyoto/Osaka"
    ],
    itinerary: [
      "Day 1: Nara Park, Todai-ji Temple, Kasuga Taisha",
      "Day 2: Naramachi district, mochi making, departure"
    ]
  },
  {
    title: "Mount Fuji & Hakone Retreat",
    destination: "Hakone, Japan",
    description: "Experience the iconic Mount Fuji and relax in traditional hot springs. Perfect for nature lovers and those seeking a peaceful retreat.",
    duration: 3,
    price: 46750,
    startDate: "2025-07-12",
    endDate: "2025-07-14",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/mtfuji.jpg",
    isActive: true,
    maxParticipants: 6,
    highlights: [
      "Mount Fuji viewing from Lake Ashi",
      "Hakone hot spring experience",
      "Pirate ship cruise on Lake Ashi",
      "Hakone Open-Air Museum",
      "Traditional ryokan with kaiseki dinner"
    ],
    included: [
      "2 nights ryokan accommodation",
      "All meals (kaiseki dinner included)",
      "Hakone Free Pass",
      "Hot spring access",
      "Professional guide",
      "Round-trip transportation from Tokyo"
    ],
    itinerary: [
      "Day 1: Arrival, Lake Ashi cruise, hot spring",
      "Day 2: Mount Fuji viewing, Hakone Open-Air Museum",
      "Day 3: Free time, departure"
    ]
  },
  {
    title: "Hiroshima Peace & Miyajima",
    destination: "Hiroshima, Japan",
    description: "A meaningful journey to Hiroshima's Peace Memorial Park and the sacred island of Miyajima with its famous floating torii gate.",
    duration: 2,
    price: 37400,
    startDate: "2025-08-15",
    endDate: "2025-08-16",
    availabilityUntil: "2025-12-31",
    imageUrl: "/assets/hirshima.jpg",
    isActive: true,
    maxParticipants: 10,
    highlights: [
      "Hiroshima Peace Memorial Park",
      "Atomic Bomb Dome",
      "Miyajima Island ferry ride",
      "Itsukushima Shrine floating torii",
      "Wild deer on Miyajima"
    ],
    included: [
      "1 night accommodation",
      "All meals",
      "Ferry tickets to Miyajima",
      "Shrine entrance fees",
      "Professional guide",
      "Transportation from Osaka/Kyoto"
    ],
    itinerary: [
      "Day 1: Hiroshima Peace Park, Atomic Bomb Dome, Miyajima Island",
      "Day 2: Itsukushima Shrine, deer feeding, departure"
    ]
  }
];

export async function addSamplePackages(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    console.log('🚀 Adding sample packages to database...');
    
    let successCount = 0;
    const errors: string[] = [];
    
    for (const packageData of samplePackages) {
      try {
        console.log(`📦 Adding package: ${packageData.title}`);
        
        const tourData = {
          title: packageData.title,
          destination: packageData.destination,
          description: packageData.description,
          duration: packageData.duration,
          price: packageData.price,
          startDate: packageData.startDate,
          endDate: packageData.endDate,
          availabilityUntil: packageData.availabilityUntil,
          imageUrl: packageData.imageUrl,
          isActive: packageData.isActive,
          maxParticipants: packageData.maxParticipants,
          highlights: packageData.highlights,
          included: packageData.included,
          itinerary: packageData.itinerary
        };
        
        const tourId = await TourService.createTour(tourData);
        console.log(`✅ Package created with ID: ${tourId}`);
        successCount++;
        
      } catch (error) {
        const errorMsg = `Failed to create ${packageData.title}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const message = successCount > 0 
      ? `Successfully added ${successCount} packages! ${errors.length > 0 ? `Errors: ${errors.length}` : ''}`
      : `Failed to add packages. Errors: ${errors.join(', ')}`;
    
    console.log(`🎉 Package addition completed: ${message}`);
    
    return {
      success: successCount > 0,
      message,
      count: successCount
    };
    
  } catch (error) {
    console.error('❌ Error adding sample packages:', error);
    return {
      success: false,
      message: `Failed to add packages: ${error}`,
      count: 0
    };
  }
}

export { samplePackages };
