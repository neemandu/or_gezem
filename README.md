# A.V.R. Gezem Ltd. - Green Waste Management System

## 📋 Overview

A comprehensive web application for managing urban green-waste container collection and recycling operations. The system enables field operators to document container collections with photos, volumes, and notes, while automatically calculating pricing, notifying settlement contacts via WhatsApp, and providing comprehensive reporting dashboards.

### 🏢 Business Context

A.V.R. Gezem Ltd. specializes in collecting and recycling urban green-waste containers, then returning the processed material to the original settlements. This system streamlines the entire process from field data collection to automated billing and notifications.

## 🚀 Features

### Core Functionality

- **Mobile-First Data Collection**: Field operators can capture container photos, enter volumes, and submit reports
- **Automated Pricing Calculation**: Dynamic pricing based on settlement-tank combinations
- **WhatsApp Notifications**: Automatic notifications to settlement contacts with pricing information
- **Multi-Role Dashboard**: Comprehensive reporting with role-based access control
- **Hebrew RTL Interface**: Full Hebrew language support with right-to-left layout

### Key Capabilities

- 📱 Mobile camera integration for container documentation
- 💰 Flexible pricing management per settlement-tank combinations
- 📊 Advanced filtering and reporting with export capabilities
- 🔐 Role-based access control (ADMIN, SETTLEMENT_USER, DRIVER)
- 📨 Automated WhatsApp notifications via Green API
- 🖼️ Image storage and management with Supabase Storage
- 📈 Real-time analytics and reporting

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with Hebrew RTL support
- **Language**: Hebrew UI with English codebase
- **Responsive Design**: Mobile-first approach

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Image Storage**: Supabase Storage
- **Deployment**: Vercel

### Integrations

- **WhatsApp**: Green API for automated notifications
- **File Storage**: Supabase Storage for image management
- **Database**: Supabase for real-time data

## 👥 User Roles & Permissions

### 🚛 DRIVER

- **Access**: Mobile-only `/mobile-report` page
- **Capabilities**:
  - Select settlement from dropdown
  - Capture/upload container photos
  - Enter volume measurements
  - Add notes
  - Submit reports with automatic pricing calculation
- **Restrictions**: Cannot access any other system pages

### 🏘️ SETTLEMENT_USER

- **Access**: Single dashboard page with settlement-specific data
- **Capabilities**:
  - View reports filtered to their settlement only
  - Filter reports by date, driver, tank size, price range
  - Export settlement-specific data with pricing
  - View images from reports
  - View their settlement's pricing (read-only)
- **Restrictions**: Cannot modify settings or view other settlements

### 👨‍💼 ADMIN

- **Access**: Full system access
- **Capabilities**:
  - Manage all system settings including pricing
  - View all reports and analytics with full pricing data
  - Manage users, drivers, settlements
  - Configure container types and pricing
  - Export comprehensive reports with cost analysis
  - System administration
  - Bulk pricing operations

## 📊 Database Schema

### Core Tables

- **users**: Custom user profiles with role-based access
- **settlements**: Cities/settlements with contact information
- **container_types**: Container specifications and sizes
- **settlement_tank_pricing**: Flexible pricing per settlement-tank combinations
- **reports**: Container collection reports with pricing
- **notifications**: WhatsApp notification tracking

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Application Configuration
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DATABASE_URL=your_supabase_database_url

# WhatsApp Integration (Green API) - Optional
NEXT_PUBLIC_GREEN_API_INSTANCE_ID=your_green_api_instance_id
NEXT_PUBLIC_GREEN_API_ACCESS_TOKEN=your_green_api_access_token
NEXT_PUBLIC_GREEN_API_BASE_URL=https://api.green-api.com

# Security (Optional)
NEXT_PUBLIC_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key
```

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd or_gezem
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up database**

```bash
# Run Supabase migrations
npx supabase db reset
```

4. **Start development server**

```bash
npm run dev
```

5. **Access the application**

- Open [http://localhost:3000](http://localhost:3000)
- Login with your credentials

## 📱 Page Structure

### `/login`

- User authentication with Hebrew interface
- Role-based redirect after login
- **Access**: Public

### `/mobile-report`

- Mobile-optimized field data collection for drivers
- Settlement and container type selection
- Camera integration for photo capture
- Volume input and notes submission
- **Access**: DRIVER role only

### `/dashboard`

- Reports dashboard with filterable table
- Columns: Date, Settlement, Driver, Image, Tank Size, Unit Price, Total Price
- Advanced filtering and export functionality
- **Access**: ADMIN (all settlements), SETTLEMENT_USER (filtered)

### `/admin`

- System administration and settings management
- User management, pricing configuration
- **Access**: ADMIN only

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/session` - Session management

### Reports Management

- `GET /api/reports` - Get reports (with role-based filtering)
- `POST /api/reports` - Create new report with automatic pricing

### WhatsApp Integration

- `POST /api/notifications/whatsapp` - Send WhatsApp notifications

## 📱 WhatsApp Integration

### Features

- Automatic notifications after report submission
- Image attachment support
- Delivery status tracking
- Hebrew message format

### Message Template

```
דיווח איסוף מכל - [Settlement Name]
נהג: [Driver Name]
תאריך: [Date]
נפח: [Volume]m³
מחיר יחידה: [Unit Price] ₪
סה"כ לתשלום: [Total Price] ₪
```

## 💰 Pricing Management

### Business Rules

1. **Default Pricing**: System default when no specific pricing exists
2. **Price Updates**: Historical reports maintain original pricing
3. **Currency Support**: Multi-currency with ILS as default
4. **Validation**: Minimum price > 0, configurable maximum
5. **Audit Trail**: Track price changes with user and timestamp

### Automatic Calculation

When a report is submitted:

1. Lookup pricing based on settlement and container type
2. Calculate total price = volume × unit_price
3. Store calculated price in reports table
4. Include pricing in WhatsApp notifications

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control
- Session management
- Secure password hashing
- Input validation and sanitization

## 🚀 Performance Optimization

### Frontend

- Next.js Image optimization
- Lazy loading
- Component code splitting
- Bundle optimization

### Backend

- Database query optimization
- Caching strategies
- API response compression
- Image compression
- Connection pooling

## 📱 Mobile Optimization

- Mobile-first responsive design
- Touch-friendly interface
- Optimized camera integration
- Offline capability considerations
- Performance optimization for mobile networks

## 🌐 RTL Support

- Full Hebrew language interface
- Right-to-left layout
- Proper text alignment
- Icon positioning adjustments
- Form field alignment

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run prettier-watch
```

### Project Structure

```
/src
  /app           # Next.js app router pages
  /components    # Reusable UI components
  /lib           # Utility functions and configurations
  /hooks         # Custom React hooks
  /types         # TypeScript definitions
  /contexts      # React contexts
  /utils         # Helper functions
```

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working on mobile**

   - Check HTTPS requirement
   - Verify camera permissions
   - Test on different browsers

2. **WhatsApp notifications not sending**

   - Verify Green API credentials
   - Check phone number format
   - Confirm API instance status

3. **Images not uploading**
   - Check Supabase Storage configuration
   - Verify file size limits
   - Ensure proper image format

## 📄 License

This project is proprietary software developed for A.V.R. Gezem Ltd.

## 🤝 Support

For technical support or questions, please contact the development team.

---

**Document Version**: 2.2  
**Last Updated**: 2025.01.16  
**Project Status**: In Development

## Phone Number Authentication for Drivers

This system supports phone number authentication for drivers, allowing them to log in using their Israeli phone numbers instead of email addresses.

### Setup Instructions

#### 1. Configure Supabase Phone Authentication

1. **Go to your Supabase Dashboard** → Authentication → Providers
2. **Enable Phone Provider**:
   - Toggle "Enable phone provider" to ON
   - Configure phone settings as needed

#### 2. Choose and Configure SMS Provider

You need to set up an SMS provider to send OTP codes. Supabase supports:

- **Twilio** (Recommended)
- **MessageBird**
- **Vonage**
- **TextLocal** (Community supported)

##### For Twilio Setup:

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number in Twilio
4. In Supabase Dashboard → Authentication → Providers → Phone:
   - **Provider**: Select "Twilio"
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
   - **Phone Number**: Your Twilio phone number (format: +1234567890)

#### 3. Database Migration

Run the following migration to support phone authentication:

```sql
-- Make email optional for drivers
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add unique constraint to phone
ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);

-- Ensure users have either email or phone
ALTER TABLE users ADD CONSTRAINT chk_users_email_or_phone
CHECK ((email IS NOT NULL) OR (phone IS NOT NULL));
```

#### 4. Environment Variables

No additional environment variables are needed. Supabase handles phone authentication through your dashboard configuration.

### Driver Authentication Options

The system now supports two authentication methods:

#### Option 1: Phone + Password (Current Implementation)

- Drivers log in with their phone number and password
- Similar to email authentication but uses phone numbers
- Recommended for simplicity

#### Option 2: Phone OTP (Passwordless)

To enable OTP-only authentication, modify the `signInWithPhone` method in `auth-context.tsx`:

```typescript
const signInWithPhoneOTP = async (phone: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
};
```

### Usage

1. **Creating Drivers**: Use the admin interface at `/settings/drivers` to add new drivers with phone numbers
2. **Driver Login**: Drivers can now log in at `/login` using either:
   - Email + Password (existing users)
   - Phone + Password (new drivers)

### Phone Number Format

The system validates Israeli phone numbers in the format:

- `+972-XX-XXXXXXX`
- `0XX-XXXXXXX`
- Examples: `052-1234567`, `+972-52-1234567`

### Benefits

- **Better User Experience**: Drivers don't need to remember email addresses
- **Localized**: Works well with Israeli phone number format
- **Security**: Phone numbers are often more secure than email for drivers
- **SMS Integration**: Can send notifications via SMS using the same phone numbers

### Migration from Email to Phone

Existing drivers with email authentication will continue to work. New drivers can be created with phone numbers only. To migrate existing drivers:

1. Add phone numbers to existing driver records
2. Update their authentication method in Supabase Auth
3. Inform drivers of the new login method
