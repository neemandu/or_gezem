# A.V.R. Gezem Ltd. - Green Waste Management System

## Technical Specification & Project Documentation (Updated with Pricing Management)

### 1. Project Overview

**Business Context**
A.V.R. Gezem Ltd. specializes in collecting and recycling urban green-waste containers, then returning the processed material to the original settlements. The system enables field operators to document container collections with photos, volumes, and notes, while automatically calculating pricing, notifying settlement contacts and providing comprehensive reporting dashboards.

**System Objectives**

- Streamline field data collection for waste container management
- Provide real-time notifications to settlement contacts with pricing information
- Enable comprehensive reporting and analytics with cost calculations
- Support multi-role access with appropriate permissions
- Maintain Hebrew RTL interface for all users
- Manage flexible pricing per settlement-tank combinations

### 2. Technical Architecture

**Technology Stack**

- Frontend Framework: Next.js 14 with React 18
- Styling: Tailwind CSS with Hebrew RTL support
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Image Storage: Cloudinary
- Deployment: Vercel
- Language: Hebrew UI with English codebase

### 3. User Roles & Permissions

**Role Definitions**

**DRIVER**

- Access: Mobile-only /report page
- Capabilities:
  - Select settlement from dropdown
  - Capture/upload container photos
  - Enter volume measurements
  - Add notes
  - Submit reports (with automatic pricing calculation)
- Restrictions: Cannot access any other system pages

**SETTLEMENT_USER**

- Access: Single dashboard page with settlement-specific data
- Capabilities:
  - View reports dashboard filtered to their settlement only
  - Filter reports by date, driver, tank size, price range
  - Export settlement-specific data with pricing
  - View images from reports
  - View their settlement's pricing (read-only)
- Restrictions: Cannot modify system settings, view other settlements, or access admin features

**ADMIN**

- Access: Full system access
- Capabilities:
  - Manage all system settings including pricing
  - View all reports and analytics with full pricing data
  - Manage users, drivers, settlements
  - Configure container types and pricing
  - Export comprehensive reports with cost analysis
  - System administration
  - Full pricing management access
  - Price history viewing
  - Bulk pricing operations

### 4. Database Schema - Core Tables

**users (Custom User Profile Table)**

- id: uuid (primary key, references auth.users.id)
- email: varchar
- role: enum('ADMIN', 'SETTLEMENT_USER', 'DRIVER')
- settlement_id: uuid (foreign key)
- created_at: timestamp
- updated_at: timestamp

**settlements (Cities/Settlements)**

- id: uuid (primary key)
- name: varchar
- contact_phone: varchar
- contact_person: varchar
- created_at: timestamp
- updated_at: timestamp

**container_types**

- id: uuid (primary key)
- name: varchar
- size: decimal
- unit: varchar (default: 'm³')
- created_at: timestamp
- updated_at: timestamp

**settlement_tank_pricing**

### settlement_tank_pricing

- id: uuid (primary key)
- settlement_id: uuid (foreign key to settlements)
- container_type_id: uuid (foreign key to container_types)
- price: decimal(10,2)
- currency: varchar (default: 'ILS')
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

**Indexes:**

- Unique constraint on (settlement_id, container_type_id) to prevent duplicate pricing
- Index on settlement_id for fast lookups
- Index on container_type_id for fast lookups

**reports (Enhanced)**

- id: uuid (primary key)
- settlement_id: uuid (foreign key)
- driver_id: uuid (foreign key)
- container_type_id: uuid (foreign key)
- volume: decimal
- notes: text
- image_url: varchar
- image_public_id: varchar (Cloudinary)
- unit_price: decimal(10,2) (NEW)
- total_price: decimal(10,2) (NEW)
- currency: varchar (default: 'ILS') (NEW)
- notification_sent: boolean
- created_at: timestamp
- updated_at: timestamp

**notifications**

- id: uuid (primary key)
- report_id: uuid (foreign key)
- type: enum('WHATSAPP')
- status: enum('PENDING', 'SENT', 'FAILED', 'DELIVERED')
- green_api_message_id: varchar (Green API message tracking)
- message: text
- sent_at: timestamp
- delivered_at: timestamp
- created_at: timestamp

### 5. API Endpoints

**Authentication**

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

**Reports (Enhanced)**

- GET /api/reports # Get all reports with pricing (admin) or filtered (settlement user)
- POST /api/reports # Create new report with automatic pricing calculation
- GET /api/reports/[id] # Get specific report with pricing

**Pricing Management (New)**

- GET /api/pricing # Get all pricing (admin only)
- POST /api/pricing # Create new pricing (admin only)
- GET /api/pricing/settlement/[id] # Get pricing for specific settlement
- PUT /api/pricing/[id] # Update pricing (admin only)
- DELETE /api/pricing/[id] # Delete pricing (admin only)
- GET /api/pricing/calculate # Calculate total price for report

**Settlements**

- GET /api/settlements # Get all settlements
- POST /api/settlements # Create settlement (admin only)
- GET /api/settlements/[id] # Get specific settlement
- PUT /api/settlements/[id] # Update settlement
- DELETE /api/settlements/[id] # Delete settlement

**Drivers**

- GET /api/drivers # Get all drivers
- POST /api/drivers # Create driver (admin only)
- GET /api/drivers/[id] # Get specific driver
- PUT /api/drivers/[id] # Update driver
- DELETE /api/drivers/[id] # Delete driver

**Container Types**

- GET /api/tanks # Get all container types
- POST /api/tanks # Create container type (admin only)
- GET /api/tanks/[id] # Get specific container type
- PUT /api/tanks/[id] # Update container type
- DELETE /api/tanks/[id] # Delete container type

**Image Upload**

- POST /api/upload/image # Upload image to Cloudinary
- DELETE /api/upload/image/[id] # Delete image from Cloudinary

**Notifications**

- POST /api/notifications/whatsapp # Send WhatsApp notification via Green API
- GET /api/notifications # Get notification history
- GET /api/notifications/status # Check delivery status

### 6. Page Structure & Components

**Pages**

**/login**

- Purpose: User authentication
- Features:
  - Hebrew login form
  - Email/password authentication
  - Role-based redirect after login
  - Responsive design
  - No sign up. Only signIn.
- Access: Public

**/report (Mobile-Only)**

- Purpose: Field data collection for drivers
- Features:
  - Settlement selection dropdown
  - Container type selection
  - Camera integration for photo capture
  - Volume input (numeric)
  - Notes textarea
  - Submit functionality (with automatic pricing calculation)
  - Success/error notifications
- Access: DRIVER role only
- Responsive: Mobile-first design

**/data (Dashboard - Enhanced)**

- Purpose: Reports dashboard with filterable table
- Features:
  - Columns (in Hebrew):
    - תאריך (Date)
    - שם היישוב (Settlement Name)
    - שם הנהג (Driver Name)
    - תמונה (Image - thumbnail with click to view full size)
    - גודל מכל (Tank Size)
    - מחיר יחידה (Unit Price) (NEW)
    - מחיר כולל (Total Price) (NEW)
    - מטבע (Currency) (NEW)
  - Filters:
    - Date range picker
    - Settlement dropdown (ADMIN only - auto-filtered for SETTLEMENT_USER)
    - Driver dropdown
    - Tank size dropdown
    - Price range filter (NEW)
    - Currency filter (NEW)
  - Additional Features:
    - Sorting by all columns
    - Export functionality (PDF, Excel) with pricing
    - Pagination
    - Image modal for full-size viewing
- Access: ADMIN (all settlements), SETTLEMENT_USER (their settlement only)

**/settings**

- Purpose: System configuration
- Features:
  - Tabbed interface for different entities
  - CRUD operations for all entities
  - Modal dialogs for add/edit
  - Confirmation dialogs for delete
  - Data validation
  - Additional Tab: תמחור (Pricing) - Links to /settings/pricing (NEW)
- Access: ADMIN only

**/settings/pricing (New Page)**

- Purpose: Manage pricing for settlement and tank combinations
- Features:
  - Matrix-style pricing table showing settlements vs tank types
  - Inline editing for price values
  - Bulk pricing updates
  - Price history tracking
  - Import/export pricing data
  - Price validation (minimum/maximum limits)
- Access: ADMIN only

**/settings/drivers**

- Purpose: Driver management
- Features:
  - Driver list with inline editing
  - Add/edit/delete drivers
  - Active/inactive status
- Access: ADMIN only

**/settings/cities**

- Purpose: Settlement management
- Features:
  - Settlement list with contact information
  - WhatsApp number configuration
  - Contact person details
- Access: ADMIN only

**/settings/tanks**

- Purpose: Container type management
- Features:
  - Container type list
  - Size configuration
  - Unit management
  - Type categorization
- Access: ADMIN only

### 7. UI/UX Specifications

**Design System**

- Colors:

  - primary-gray-100: #F5F5F5
  - primary-blue-200: #E6EEF7
  - text-primary: #1F2937
  - text-secondary: #6B7280
  - success: #10B981
  - error: #EF4444
  - warning: #F59E0B

- Typography:
  - Font Family: Inter (sans-serif)
  - Base Size: 16px
  - Line Height: 1.5
  - Font Weights: 400, 500, 600, 700

**Responsive Breakpoints**

- Mobile: ≤640px
- Tablet: 641px - 1024px
- Desktop: >1024px

**RTL Support**

- All text content in Hebrew
- Right-to-left layout
- Proper text alignment
- Icon positioning adjustments
- Form field alignment

**Additional Components (New)**

- PricingMatrix Component for managing settlement-tank pricing combinations
- Price input component with currency formatting
- Price validation with min/max constraints
- Currency selector component

### 8. Integration Requirements

**Supabase Configuration**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

**Cloudinary Configuration**

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**WhatsApp Integration (Green API) - Enhanced**

- Service Configuration:

  - Provider: Green API (https://green-api.com)
  - API Endpoint: https://green-api.com/en/docs/api/sending/SendFileByUrl/
  - Authentication: Requires phone number connection setup
  - File Sending: Supports sending images via URL

- Environment Variables:

```
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_ACCESS_TOKEN=your_access_token
GREEN_API_PHONE_NUMBER=your_whatsapp_phone_number
```

**Implementation Details**

- Trigger: Automatic notification after report submission
- Content: Container collection notification with image and pricing
- Recipients: Settlement contact WhatsApp number
- Enhanced Message Format:

```
דיווח איסוף מכל - [Settlement Name]
נהג: [Driver Name]
תאריך: [Date]
נפח: [Volume]m³
מחיר יחידה: [Unit Price] ₪
סה"כ לתשלום: [Total Price] ₪
```

- Attachment: Container image from Cloudinary URL
- Status Tracking: Delivery confirmation and error handling

**Automatic Price Calculation Logic**
When a report is submitted:

1. Lookup pricing based on settlement_id and container_type_id
2. Calculate total price = volume × unit_price
3. Store calculated price in reports table
4. Include pricing information in WhatsApp notifications

### 9. Business Rules for Pricing

1. **Default Pricing:** If no specific pricing exists for a settlement-tank combination, use system default or show warning
2. **Price Updates:** Historical reports maintain their original pricing; only new reports use updated prices
3. **Currency Support:** Multi-currency support with ILS as default
4. **Validation:** Minimum price > 0, maximum price configurable per tank type
5. **Audit Trail:** Track price changes with user, timestamp, and reason

### 10. Security Features

- Authentication: JWT token-based authentication
- Role-based access control
- Session management
- Secure password hashing

### 11. Performance Optimization

**Frontend**

- Next.js Image optimization
- Lazy loading
- Component code splitting
- Bundle optimization

**Backend**

- Database query optimization
- Caching strategies
- API response compression
- Image compression
- Connection pooling

---

**Document Version:** 2.1  
**Last Updated:** 2025.07.16  
**Changes:** Added comprehensive pricing management system
