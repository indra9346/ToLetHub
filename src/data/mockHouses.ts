export interface House {
  id: string;
  title: string;
  address: string;
  rent: number;
  rooms: number;
  bathrooms: number;
  hasHall: boolean;
  hasKitchen: boolean;
  images: string[];
  lat: number;
  lng: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: "vacant" | "occupied";
  amenities: string[];
  description: string;
  area: number; // sq ft
  createdAt: string;
}

export const mockHouses: House[] = [
  {
    id: "1",
    title: "Modern 2BHK Apartment in City Center",
    address: "123 MG Road, Bangalore, Karnataka",
    rent: 18000,
    rooms: 2,
    bathrooms: 2,
    hasHall: true,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    lat: 12.9716,
    lng: 77.5946,
    contactName: "Rajesh Kumar",
    contactPhone: "+91 98765 43210",
    contactEmail: "rajesh@email.com",
    status: "vacant",
    amenities: ["Parking", "Lift", "Security", "Power Backup", "Water Supply"],
    description: "Spacious and well-ventilated 2BHK apartment in the heart of the city. Close to metro station, shopping malls, and schools. Fully furnished with modern amenities.",
    area: 1100,
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    title: "Cozy 1BHK Near IT Park",
    address: "45 Whitefield Main Road, Bangalore",
    rent: 12000,
    rooms: 1,
    bathrooms: 1,
    hasHall: true,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    lat: 12.9698,
    lng: 77.7500,
    contactName: "Priya Sharma",
    contactPhone: "+91 87654 32109",
    contactEmail: "priya@email.com",
    status: "vacant",
    amenities: ["Parking", "Gym", "Swimming Pool", "Club House"],
    description: "Perfect for working professionals. Located near major IT parks with excellent connectivity. Semi-furnished with wardrobe and kitchen cabinets.",
    area: 650,
    createdAt: "2026-03-03",
  },
  {
    id: "3",
    title: "Luxury 3BHK Villa with Garden",
    address: "78 HSR Layout, Bangalore",
    rent: 35000,
    rooms: 3,
    bathrooms: 3,
    hasHall: true,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    lat: 12.9116,
    lng: 77.6389,
    contactName: "Amit Patel",
    contactPhone: "+91 76543 21098",
    contactEmail: "amit@email.com",
    status: "vacant",
    amenities: ["Garden", "Parking", "Security", "Power Backup", "Terrace"],
    description: "Stunning 3BHK independent villa with private garden and terrace. Perfect for families. Located in a quiet residential area with all amenities nearby.",
    area: 2200,
    createdAt: "2026-02-28",
  },
  {
    id: "4",
    title: "Affordable Studio Apartment",
    address: "12 Electronic City, Bangalore",
    rent: 8000,
    rooms: 1,
    bathrooms: 1,
    hasHall: false,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
    ],
    lat: 12.8440,
    lng: 77.6568,
    contactName: "Sneha Reddy",
    contactPhone: "+91 65432 10987",
    contactEmail: "sneha@email.com",
    status: "vacant",
    amenities: ["Security", "Water Supply", "Laundry"],
    description: "Budget-friendly studio apartment ideal for students and bachelors. Basic amenities included. Close to bus stop and local market.",
    area: 400,
    createdAt: "2026-03-05",
  },
  {
    id: "5",
    title: "Spacious 2BHK with Lake View",
    address: "56 Hebbal, Bangalore",
    rent: 22000,
    rooms: 2,
    bathrooms: 2,
    hasHall: true,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    lat: 13.0358,
    lng: 77.5970,
    contactName: "Vikram Singh",
    contactPhone: "+91 54321 09876",
    contactEmail: "vikram@email.com",
    status: "occupied",
    amenities: ["Lake View", "Parking", "Lift", "Gym", "Security", "Power Backup"],
    description: "Beautiful 2BHK apartment with stunning lake view. Premium gated community with world-class amenities. Fully furnished with modular kitchen.",
    area: 1250,
    createdAt: "2026-02-25",
  },
  {
    id: "6",
    title: "Premium 4BHK Penthouse",
    address: "99 Indiranagar, Bangalore",
    rent: 55000,
    rooms: 4,
    bathrooms: 4,
    hasHall: true,
    hasKitchen: true,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    ],
    lat: 12.9784,
    lng: 77.6408,
    contactName: "Meera Nair",
    contactPhone: "+91 43210 98765",
    contactEmail: "meera@email.com",
    status: "vacant",
    amenities: ["Terrace", "Private Pool", "Parking", "Lift", "Security", "Smart Home"],
    description: "Ultra-luxury penthouse with panoramic city views. Smart home features, private pool on terrace, designer interiors. The pinnacle of urban living.",
    area: 3500,
    createdAt: "2026-03-07",
  },
];
