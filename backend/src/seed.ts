import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { Bus } from './models/Bus';
import { Driver } from './models/Driver';
import { Expense } from './models/Expense';
import { Route } from './models/Route';
import { Student } from './models/Student';

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      Bus.deleteMany({}),
      Driver.deleteMany({}),
      Expense.deleteMany({}),
      Route.deleteMany({}),
      Student.deleteMany({}),
    ]);

    console.log('Seeding fake data...');

    // 1. Drivers
    const driverDocs = await Driver.insertMany([
      { driverId: 'DRV-101', name: 'Ramesh Singh', phone: '9876543210', address: '123 MG Road, Delhi', salary: 15000, isActive: true },
      { driverId: 'DRV-102', name: 'Suresh Kumar', phone: '9876543211', address: '456 KP Lane, Delhi', salary: 16000, isActive: true },
      { driverId: 'DRV-103', name: 'Anil Yadav', phone: '9876543212', address: '789 VP Street, Delhi', salary: 14000, isActive: false },
    ]);

    // 2. Buses
    const busDocs = await Bus.insertMany([
      { busNumber: 'BUS-01', plateNumber: 'DL 1P 1234', capacity: 40, status: 'running', currentDriverId: driverDocs[0]._id },
      { busNumber: 'BUS-02', plateNumber: 'DL 1P 5678', capacity: 50, status: 'idle', currentDriverId: driverDocs[1]._id },
      { busNumber: 'BUS-03', plateNumber: 'UP 16 9012', capacity: 30, status: 'maintenance' },
    ]);

    // 3. Update Drivers with Bus IDs
    driverDocs[0].assignedBusId = busDocs[0]._id as any;
    await driverDocs[0].save();
    driverDocs[1].assignedBusId = busDocs[1]._id as any;
    await driverDocs[1].save();

    // 4. Routes
    const routeDocs = await Route.insertMany([
      { 
        routeName: 'Route A - City Center', 
        assignedBusId: busDocs[0]._id,
        stops: [
          { name: 'Central Park', order: 1 },
          { name: 'City Hall', order: 2 },
          { name: 'Bus Terminal', order: 3 },
        ]
      },
      { 
        routeName: 'Route B - North Campus', 
        assignedBusId: busDocs[1]._id,
        stops: [
          { name: 'North Gate', order: 1 },
          { name: 'Science Block', order: 2 },
          { name: 'Library', order: 3 },
        ]
      },
    ]);

    // 5. Students
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    await Student.insertMany([
      { 
        studentId: 'STU-1001', name: 'Aarav Patel', parentPhone: '9123456780', 
        duration: '1y', routeId: routeDocs[0]._id, stopId: 'City Hall', 
        paymentStatus: 'paid', expiryDate: oneYearFromNow, isActive: true 
      },
      { 
        studentId: 'STU-1002', name: 'Isha Sharma', parentPhone: '9123456781', 
        duration: '6m', routeId: routeDocs[0]._id, stopId: 'Central Park', 
        paymentStatus: 'unpaid', expiryDate: pastDate, isActive: true 
      },
      { 
        studentId: 'STU-1003', name: 'Kabir Khan', parentPhone: '9123456782', 
        duration: '1y', routeId: routeDocs[1]._id, stopId: 'Science Block', 
        paymentStatus: 'bypassed', expiryDate: oneYearFromNow, isActive: true 
      },
      { 
        studentId: 'STU-1004', name: 'Riya Gupta', parentPhone: '9123456783', 
        duration: '6m', routeId: routeDocs[1]._id, stopId: 'Library', 
        paymentStatus: 'paid', expiryDate: oneYearFromNow, isActive: true 
      },
      { 
        studentId: 'STU-1005', name: 'Dev Joshi', parentPhone: '9123456784', 
        duration: '1y', routeId: routeDocs[0]._id, stopId: 'Bus Terminal', 
        paymentStatus: 'paid', expiryDate: oneYearFromNow, isActive: false 
      },
    ]);

    // 6. Expenses
    await Expense.insertMany([
      { type: 'fuel', amount: 5500, date: new Date(), description: 'Diesel refill for Bus 01', busId: busDocs[0]._id },
      { type: 'maintenance', amount: 12000, date: new Date(), description: 'Engine repair for Bus 03', busId: busDocs[2]._id },
      { type: 'daily', amount: 200, date: new Date(), description: 'Toll tax', busId: busDocs[1]._id },
    ]);

    console.log('Fake data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
