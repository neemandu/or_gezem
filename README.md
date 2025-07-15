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
- 🖼️ Image storage and management with Cloudinary
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
- **Image Storage**: Cloudinary
- **Deployment**: Vercel

### Integrations
- **WhatsApp**: Green API for automated notifications
- **File Storage**: Cloudinary for image management
- **Database**: Supabase for real-time data

## 👥 User Roles & Permissions

### 🚛 DRIVER
- **Access**: Mobile-only `/report` page
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
- Cloudinary account
- Green API WhatsApp account

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# WhatsApp Integration (Green API)
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_ACCESS_TOKEN=your_access_token
GREEN_API_PHONE_NUMBER=your_whatsapp_phone_number
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd avr-gezem-system
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
- User authentication
- Hebrew login form
- Role-based redirect after login
- **Access**: Public

### `/report` (Mobile-Only)
- Field data collection for drivers
- Settlement and container type selection
- Camera integration for photo capture
- Volume input and notes
- **Access**: DRIVER role only

### `/data` (Dashboard)
- Reports dashboard with filterable table
- Columns: Date, Settlement, Driver, Image, Tank Size, Unit Price, Total Price
- Filters: Date range, Settlement, Driver, Tank size, Price range
- Export functionality (PDF, Excel)
- **Access**: ADMIN (all settlements), SETTLEMENT_USER (filtered)

### `/settings`
- System configuration with tabbed interface
- CRUD operations for all entities
- **Access**: ADMIN only

#### Settings Sub-pages:
- `/settings/pricing` - Pricing management
- `/settings/drivers` - Driver management
- `/settings/cities` - Settlement management
- `/settings/tanks` - Container type management

## 🎨 Design System

### Colors
- `primary-gray-100`: #F5F5F5
- `primary-blue-200`: #E6EEF7
- `text-primary`: #1F2937
- `text-secondary`: #6B7280
- `success`: #10B981
- `error`: #EF4444
- `warning`: #F59E0B

### Typography
- **Font Family**: Inter (sans-serif)
- **Base Size**: 16px
- **Line Height**: 1.5
- **Font Weights**: 400, 500, 600, 700

### Responsive Breakpoints
- **Mobile**: ≤640px
- **Tablet**: 641px - 1024px
- **Desktop**: >1024px

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Reports
- `GET /api/reports` - Get all reports (with role-based filtering)
- `POST /api/reports` - Create new report with automatic pricing
- `GET /api/reports/[id]` - Get specific report

### Pricing Management
- `GET /api/pricing` - Get all pricing (admin only)
- `POST /api/pricing` - Create new pricing
- `GET /api/pricing/settlement/[id]` - Get settlement-specific pricing
- `PUT /api/pricing/[id]` - Update pricing
- `DELETE /api/pricing/[id]` - Delete pricing

### Additional Endpoints
- `/api/settlements` - Settlement management
- `/api/drivers` - Driver management
- `/api/tanks` - Container type management
- `/api/upload/image` - Image upload to Cloudinary
- `/api/notifications/whatsapp` - WhatsApp notifications

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

## 📊 Reporting & Analytics

### Dashboard Features
- Real-time data visualization
- Advanced filtering capabilities
- Export to PDF and Excel
- Price range analysis
- Settlement performance metrics

### Export Options
- PDF reports with Hebrew support
- Excel exports with pricing data
- Date range filtering
- Settlement-specific exports
- Driver performance reports

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
npm run format
```

### Project Structure
```
/src
  /components     # Reusable UI components
  /pages         # Next.js pages
  /lib           # Utility functions
  /hooks         # Custom React hooks
  /styles        # Global styles
  /types         # TypeScript definitions
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
   - Check Cloudinary configuration
   - Verify file size limits
   - Ensure proper image format

## 📄 License

This project is proprietary software developed for A.V.R. Gezem Ltd.

## 🤝 Support

For technical support or questions, please contact the development team.

---

**Document Version**: 2.1  
**Last Updated**: 2025.07.16  
**Project Status**: In Development