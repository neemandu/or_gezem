# Hebrew Green Waste Management System - Database Setup

## Overview

This directory contains the complete Supabase database schema for a Hebrew green waste management system. The system manages waste collection reports, settlements, drivers, pricing, and WhatsApp notifications.

## Features

- **Role-based Access Control**: ADMIN, SETTLEMENT_USER, and DRIVER roles with appropriate permissions
- **Multilingual Support**: Hebrew interface with RTL support
- **WhatsApp Integration**: Automated notifications via Green API
- **Image Management**: Support for waste collection photos
- **Comprehensive Reporting**: Volume tracking, pricing calculations, and analytics
- **Security**: Row Level Security (RLS) policies for data protection

## Database Schema

### Tables

1. **`settlements`** - Municipal settlements/communities

   - Basic information: name, contact details
   - Serves as the primary organizational unit

2. **`users`** - Custom user profiles with role-based access

   - Roles: ADMIN, SETTLEMENT_USER, DRIVER
   - Settlement association for access control

3. **`container_types`** - Types and sizes of waste containers

   - Configurable container sizes and units
   - Used for pricing calculations

4. **`settlement_tank_pricing`** - Pricing configuration per settlement

   - Settlement-specific pricing for each container type
   - Currency support (default: ILS)

5. **`reports`** - Waste collection reports submitted by drivers

   - Volume tracking, images, pricing calculations
   - Automatic total price calculation (volume × unit_price)

6. **`notifications`** - WhatsApp notifications for settlements
   - Integration with Green API
   - Delivery status tracking

### User Roles & Permissions

- **ADMIN**: Full system access, user management, all data
- **SETTLEMENT_USER**: Own settlement data only, pricing management
- **DRIVER**: Create reports, view own reports, read-only access to settlements and pricing

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Docker (for local Supabase)
- Supabase CLI

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Supabase

```bash
# Start local Supabase stack
supabase start

# Check status
supabase status
```

### 3. Apply Migrations

```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase db push --include-all
```

### 4. Verify Setup

The seed data includes:

- 3 settlements: מושב נהלל, קיבוץ דגניה א', מועצה אזורית עמק יזרעאל
- 3 container types: מכל קטן (2.5m³), מכל בינוני (5m³), מכל גדול (8m³)
- 1 admin user: `admin@green-waste.co.il`
- 3 settlement users (one per settlement)
- 2 driver users
- Sample pricing and reports

### 5. Access Supabase Studio

Open http://localhost:54323 to access Supabase Studio for database management.

## Migration Files

1. **`20240101000001_initial_schema.sql`**

   - Creates all tables, enums, constraints, and indexes
   - Sets up triggers for `updated_at` timestamps
   - Adds validation constraints

2. **`20240101000002_rls_policies.sql`**

   - Implements Row Level Security policies
   - Creates helper functions for role-based access
   - Sets up security constraints

3. **`20240101000003_seed_data.sql`**
   - Adds Hebrew test data
   - Creates sample settlements, users, and reports
   - Includes data integrity verification

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Third-party integrations
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_key

# Green API (for WhatsApp notifications)
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_TOKEN=your_token
```

## TypeScript Integration

Import types from `src/types/database.ts`:

```typescript
import {
  Settlement,
  User,
  Report,
  UserRole,
  ReportWithRelations,
} from '@/types/database';

// Example usage
const user: User = {
  id: '123',
  email: 'user@example.com',
  role: 'DRIVER',
  settlement_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

## API Usage Examples

### Fetching Reports (with RLS)

```typescript
// As ADMIN - sees all reports
const { data: allReports } = await supabase.from('reports').select(`
    *,
    settlement:settlements(*),
    driver:users!driver_id(*),
    container_type:container_types(*)
  `);

// As SETTLEMENT_USER - only own settlement's reports
const { data: settlementReports } = await supabase
  .from('reports')
  .select('*')
  .eq('settlement_id', userSettlementId);

// As DRIVER - only own reports
const { data: driverReports } = await supabase
  .from('reports')
  .select('*')
  .eq('driver_id', userId);
```

### Creating a Report

```typescript
const newReport: ReportInsert = {
  settlement_id: 'settlement-uuid',
  driver_id: 'driver-uuid',
  container_type_id: 'container-uuid',
  volume: 4.5,
  notes: 'איסוף פסולת ירוקה מהגן הציבורי',
  unit_price: 60.0,
  total_price: 270.0, // 4.5 * 60.00
  currency: 'ILS',
  notification_sent: false,
};

const { data, error } = await supabase.from('reports').insert(newReport);
```

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Email Validation**: Users must confirm email addresses
3. **Role Constraints**: Users cannot modify their own roles
4. **Data Integrity**: Foreign key constraints and validation rules
5. **Israeli Phone Format**: Validates Israeli phone number format

## Monitoring & Analytics

The system includes built-in analytics for:

- Settlement performance tracking
- Driver activity monitoring
- Volume and revenue reporting
- Notification delivery status

## Backup & Recovery

```bash
# Create backup
supabase db dump --file backup.sql

# Restore from backup
psql -f backup.sql
```

## Production Deployment

1. Create a Supabase project at https://supabase.com
2. Update environment variables with production URLs
3. Apply migrations to production database
4. Configure production authentication settings
5. Set up proper CORS for your domain

## Troubleshooting

### Common Issues

1. **Migration Errors**: Check PostgreSQL logs in Supabase Studio
2. **RLS Denials**: Verify user authentication and role assignment
3. **Foreign Key Violations**: Ensure referenced records exist
4. **Email Configuration**: Check SMTP settings for notifications

### Database Reset

```bash
# Reset local database
supabase db reset

# Reapply migrations
supabase db push
```

## Contributing

When adding new features:

1. Create new migration files with incremental timestamps
2. Update TypeScript types in `src/types/database.ts`
3. Add appropriate RLS policies
4. Include seed data if needed
5. Update this README with new features

## Support

For issues and questions:

- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL constraints and triggers
- Examine RLS policies for access issues
- Verify user roles and permissions

---

**Note**: This system is designed for Hebrew RTL interfaces. Ensure your frontend components support proper RTL rendering and Hebrew text formatting.
