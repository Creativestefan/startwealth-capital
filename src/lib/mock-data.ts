/**
 * Mock data for static pages
 * This file provides fallback data for pages that need to be statically generated
 * without database access during build time
 */

import { EquipmentStatus, EquipmentType } from '@prisma/client';

// Mock investment plans for markets
export const mockMarketPlans = [
  {
    id: 'mock-plan-1',
    name: 'Growth Fund',
    description: 'A balanced growth fund with moderate risk profile.',
    minInvestment: 1000,
    expectedReturn: 12,
    duration: 12,
    status: 'ACTIVE',
    type: 'MARKETS',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mock-plan-2',
    name: 'Income Fund',
    description: 'Steady income with lower risk profile.',
    minInvestment: 500,
    expectedReturn: 8,
    duration: 6,
    status: 'ACTIVE',
    type: 'MARKETS',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock equipment for green energy
export const mockEquipment = [
  {
    id: 'mock-equipment-1',
    name: 'Solar Panel Array',
    description: 'High-efficiency solar panels for sustainable energy generation.',
    type: EquipmentType.SOLAR_PANEL,
    price: { toString: () => '5000.00' },
    status: EquipmentStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: JSON.stringify([
      'High efficiency panels',
      '25-year warranty',
      'Weather resistant'
    ]),
    stockQuantity: 10,
    images: JSON.stringify(['/images/placeholder-solar.jpg']),
  },
  {
    id: 'mock-equipment-2',
    name: 'Wind Turbine',
    description: 'Modern wind turbine for clean energy production.',
    type: EquipmentType.WIND_TURBINE,
    price: { toString: () => '8000.00' },
    status: EquipmentStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: JSON.stringify([
      'Low noise operation',
      'High power output',
      'Durable construction'
    ]),
    stockQuantity: 5,
    images: JSON.stringify(['/images/placeholder-wind.jpg']),
  },
];

// Mock properties for real estate
export const mockProperties = [
  {
    id: 'mock-property-1',
    name: 'Luxury Apartment Complex',
    description: 'Premium residential complex in prime location.',
    price: 1000000,
    expectedReturn: 10,
    duration: 60,
    location: 'Downtown Metro',
    status: 'AVAILABLE',
    type: 'RESIDENTIAL',
    imageUrl: '/images/placeholder-apartment.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mock-property-2',
    name: 'Commercial Office Building',
    description: 'Modern office space in business district.',
    price: 2000000,
    expectedReturn: 12,
    duration: 72,
    location: 'Business Park',
    status: 'AVAILABLE',
    type: 'COMMERCIAL',
    imageUrl: '/images/placeholder-office.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
