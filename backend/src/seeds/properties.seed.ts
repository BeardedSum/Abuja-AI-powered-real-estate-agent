import { AppDataSource } from '../config/database';
import { Property, PropertyType, PropertyStatus } from '../entities/Property';
import { PropertyMedia, MediaType } from '../entities/PropertyMedia';

const sampleProperties = [
  {
    title: 'Luxury 5-Bedroom Detached Duplex in Maitama',
    description:
      'Exquisite 5-bedroom detached duplex in the prestigious Maitama district. Features include a modern kitchen, spacious living areas, en-suite bathrooms, BQ, swimming pool, and 24/7 security. Perfect for families seeking luxury and comfort.',
    price: 185000000,
    neighborhood: 'Maitama',
    address: '15 Aguiyi Ironsi Street, Maitama',
    latitude: 9.082,
    longitude: 7.4893,
    bedrooms: 5,
    bathrooms: 6,
    size_sqm: 450,
    property_type: PropertyType.DUPLEX,
    status: PropertyStatus.AVAILABLE,
    features: [
      'Swimming Pool',
      'BQ',
      '24/7 Security',
      'Modern Kitchen',
      'Spacious Compound',
      'Backup Generator',
      'Parking for 4 cars',
    ],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
      building_approval: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Modern 3-Bedroom Terrace in Gwarinpa',
    description:
      'Beautiful 3-bedroom terrace house in the heart of Gwarinpa. Features include fitted kitchen, tiled floors, ample parking, and secure estate. Close to schools, markets, and major roads.',
    price: 38000000,
    neighborhood: 'Gwarinpa',
    address: 'Plot 234, Gwarinpa Estate Phase 2',
    latitude: 9.1092,
    longitude: 7.4128,
    bedrooms: 3,
    bathrooms: 4,
    size_sqm: 180,
    property_type: PropertyType.HOUSE,
    status: PropertyStatus.AVAILABLE,
    features: [
      'Fitted Kitchen',
      'Tiled Floors',
      'Secure Estate',
      'Parking',
      'Water Supply',
      'Gated Community',
    ],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: '4-Bedroom Semi-Detached Duplex in Jabi',
    description:
      'Stunning 4-bedroom semi-detached duplex in Jabi, close to Jabi Lake Mall. Modern finishing, spacious rooms, BQ, and secure compound. Great investment opportunity.',
    price: 75000000,
    neighborhood: 'Jabi',
    address: '42 Cadastral Zone, Jabi',
    latitude: 9.0648,
    longitude: 7.4433,
    bedrooms: 4,
    bathrooms: 5,
    size_sqm: 280,
    property_type: PropertyType.DUPLEX,
    status: PropertyStatus.AVAILABLE,
    features: ['BQ', 'Modern Finishing', 'Secure Compound', 'Close to Mall', 'Parking', 'Generator'],
    documents: {
      certificate_of_occupancy: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Spacious 2-Bedroom Flat in Wuse 2',
    description:
      'Well-maintained 2-bedroom apartment in Wuse 2, ideal for young professionals. Features include modern amenities, 24-hour power, and proximity to business district.',
    price: 28000000,
    neighborhood: 'Wuse 2',
    address: 'Block 5, Flat 3B, Wuse 2 Residential',
    latitude: 9.0704,
    longitude: 7.4831,
    bedrooms: 2,
    bathrooms: 2,
    size_sqm: 120,
    property_type: PropertyType.FLAT,
    status: PropertyStatus.AVAILABLE,
    features: ['24-Hour Power', 'Modern Amenities', 'Parking', 'Security', 'Close to CBD'],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: '600sqm Land in Katampe Extension',
    description:
      'Prime 600 square meter plot in the fast-developing Katampe Extension. Good access road, C of O available. Perfect for building your dream home or investment.',
    price: 22000000,
    neighborhood: 'Katampe',
    address: 'Plot 156, Katampe Extension',
    latitude: 9.0521,
    longitude: 7.4589,
    bedrooms: 0,
    bathrooms: 0,
    size_sqm: 600,
    property_type: PropertyType.LAND,
    status: PropertyStatus.AVAILABLE,
    features: ['Good Access Road', 'C of O Available', 'Developing Area', 'Rectangular Plot'],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Brand New 4-Bedroom Bungalow in Lokogoma',
    description:
      'Newly built 4-bedroom bungalow in serene Lokogoma neighborhood. Features include all en-suite rooms, modern kitchen, large compound, and excellent finishing.',
    price: 42000000,
    neighborhood: 'Lokogoma',
    address: 'Street 23, Lokogoma District',
    latitude: 8.9975,
    longitude: 7.4495,
    bedrooms: 4,
    bathrooms: 4,
    size_sqm: 220,
    property_type: PropertyType.HOUSE,
    status: PropertyStatus.AVAILABLE,
    features: [
      'All En-Suite',
      'Modern Kitchen',
      'Large Compound',
      'New Build',
      'Parking',
      'Quiet Area',
    ],
    documents: {
      certificate_of_occupancy: 'In Process',
      survey_plan: 'Available',
      building_approval: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Affordable 3-Bedroom Apartment in Lugbe',
    description:
      'Budget-friendly 3-bedroom flat in Lugbe, close to airport road. Good for first-time buyers or investors. Secure estate with basic amenities.',
    price: 15000000,
    neighborhood: 'Lugbe',
    address: 'Block 12, FHA Lugbe',
    latitude: 8.9562,
    longitude: 7.3711,
    bedrooms: 3,
    bathrooms: 2,
    size_sqm: 150,
    property_type: PropertyType.FLAT,
    status: PropertyStatus.AVAILABLE,
    features: ['Secure Estate', 'Parking', 'Close to Airport', 'Affordable', 'Good Access'],
    documents: {
      certificate_of_occupancy: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Executive 6-Bedroom Mansion in Asokoro',
    description:
      'Palatial 6-bedroom mansion in exclusive Asokoro district. Features include cinema room, gym, pool, manicured gardens, and top-tier security. For discerning buyers only.',
    price: 350000000,
    neighborhood: 'Asokoro',
    address: 'Plot 45, Asokoro Extension',
    latitude: 9.0433,
    longitude: 7.5145,
    bedrooms: 6,
    bathrooms: 8,
    size_sqm: 650,
    property_type: PropertyType.HOUSE,
    status: PropertyStatus.AVAILABLE,
    features: [
      'Cinema Room',
      'Gym',
      'Swimming Pool',
      'Manicured Gardens',
      'Top Security',
      'BQ',
      'Smart Home',
    ],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
      building_approval: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: '3-Bedroom Flat in Kubwa',
    description:
      'Clean 3-bedroom apartment in Kubwa. Suitable for families. Features include tiled floors, modern toilet, and parking space. Affordable and well-located.',
    price: 18000000,
    neighborhood: 'Kubwa',
    address: 'Phase 4, Kubwa',
    latitude: 9.148,
    longitude: 7.3277,
    bedrooms: 3,
    bathrooms: 3,
    size_sqm: 140,
    property_type: PropertyType.FLAT,
    status: PropertyStatus.AVAILABLE,
    features: ['Tiled Floors', 'Parking', 'Affordable', 'Family-Friendly', 'Good Location'],
    documents: {
      certificate_of_occupancy: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
  {
    title: 'Commercial Property in CBD',
    description:
      'Prime commercial building in Central Business District. Suitable for offices, retail, or mixed use. High visibility location with excellent access.',
    price: 280000000,
    neighborhood: 'CBD',
    address: 'Plot 1234, Central Area',
    latitude: 9.0574,
    longitude: 7.4898,
    bedrooms: 0,
    bathrooms: 10,
    size_sqm: 800,
    property_type: PropertyType.COMMERCIAL,
    status: PropertyStatus.AVAILABLE,
    features: [
      'Prime Location',
      'High Visibility',
      'Parking',
      'Commercial',
      'Excellent Access',
      'Multiple Floors',
    ],
    documents: {
      certificate_of_occupancy: 'Available',
      survey_plan: 'Available',
      building_approval: 'Available',
    },
    agent_contact: '+234 XXX XXX XXXX',
  },
];

export async function seedProperties() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const propertyRepository = AppDataSource.getRepository(Property);
    const mediaRepository = AppDataSource.getRepository(PropertyMedia);

    // Clear existing properties
    await mediaRepository.delete({});
    await propertyRepository.delete({});
    console.log('Cleared existing properties...');

    // Create properties with media
    for (const propertyData of sampleProperties) {
      const property = propertyRepository.create(propertyData);
      await propertyRepository.save(property);

      // Add sample images (3 images per property)
      for (let i = 0; i < 3; i++) {
        const media = mediaRepository.create({
          property_id: property.id,
          media_type: MediaType.IMAGE,
          url: `https://placehold.co/800x600/10b981/white?text=${encodeURIComponent(
            property.title.substring(0, 20)
          )}`,
          order: i,
          caption: i === 0 ? 'Front View' : i === 1 ? 'Interior' : 'Exterior',
        });
        await mediaRepository.save(media);
      }

      console.log(`✓ Created: ${property.title}`);
    }

    console.log(`\n✅ Successfully seeded ${sampleProperties.length} properties!`);
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedProperties();
}
