# Va Oru Trippadikkam - Kerala Trip Packages

A full-stack trip booking application for Kerala tourism built with React, TypeScript, Vite, and Supabase.

## Features

### User Features
- User registration and authentication
- Browse available trip packages
- View package details with available dates
- Book trips with member details
- Upload advance payment proof (UTR + receipt)
- View booking history and status

### Admin Features
- Separate admin login portal
- Create, edit, and delete trip packages
- Manage package availability dates
- View all users
- View and manage bookings
- Confirm bookings (triggers WhatsApp notification)
- View payment receipts and UTR details

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Supabase (Auth + PostgreSQL)
- **Icons**: Lucide React

## Database Schema

### Tables

1. **profiles**
   - id (uuid, references auth.users)
   - username (text)
   - phone (text)
   - role (text: 'user' or 'admin')
   - created_at (timestamptz)

2. **packages**
   - id (uuid)
   - title (text)
   - description (text)
   - price (numeric)
   - images (text[])
   - duration (text)
   - created_by (uuid)
   - created_at (timestamptz)

3. **package_dates**
   - id (uuid)
   - package_id (uuid, references packages)
   - available_date (date)
   - seats (integer)

4. **bookings**
   - id (uuid)
   - package_id (uuid)
   - user_id (uuid)
   - booking_date (timestamptz)
   - travel_date (date)
   - members (jsonb)
   - total_amount (numeric)
   - advance_paid (boolean)
   - advance_amount (numeric)
   - advance_utr (text)
   - advance_receipt_url (text)
   - status (text: 'pending', 'confirmed', 'cancelled')
   - created_at (timestamptz)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. The database schema has already been applied via migrations
3. Copy your Supabase URL and Anon Key

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=admin@tripadikkam
VITE_ADMIN_PASSWORD=admin1234
```

### 4. Create Admin Account

To create an admin account, you need to:

1. First, sign up a regular user account through the app
2. Get the user's UUID from Supabase Dashboard (Authentication > Users)
3. Run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

Alternatively, you can use the static admin credentials defined in the environment:
- Email: admin@tripadikkam
- Password: admin1234

This allows admin login without creating a Supabase user.

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles
- Users can view their own profile
- Users can insert their own profile (role defaults to 'user')
- Users can update their own profile

### Packages
- Anyone can view packages (public)
- Only admins can create, update, and delete packages

### Package Dates
- Anyone can view package dates (public)
- Only admins can create, update, and delete dates

### Bookings
- Users can view their own bookings
- Admins can view all bookings
- Users can create their own bookings
- Users can update their own bookings
- Admins can update all bookings

## Routes

### Public Routes
- `/` - Home page
- `/packages` - Browse packages
- `/packages/:id` - Package details
- `/contact` - Contact information
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/admin/login` - Admin login

### Protected Routes (User)
- `/bookings` - User's bookings
- `/booking/:id` - Create booking
- `/payment/:id` - Upload payment proof

### Protected Routes (Admin)
- `/admin/dashboard` - Admin dashboard
- `/admin/packages` - Manage packages
- `/admin/packages/create` - Create package
- `/admin/bookings` - All bookings
- `/admin/bookings/pending` - Pending bookings
- `/admin/bookings/confirmed` - Confirmed bookings
- `/admin/users` - View all users
- `/admin/payments` - View payments

## Payment Flow

1. User creates a booking (status: 'pending')
2. User navigates to payment page
3. User makes payment via Google Pay/UPI
4. User uploads UTR and receipt URL
5. Admin reviews payment in dashboard
6. Admin confirms booking (status: 'confirmed')
7. WhatsApp notification sent to user (optional integration)

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- User registration automatically sets role to 'user'
- Admin access requires separate login credentials
- All database operations protected by RLS policies
- Password authentication handled by Supabase Auth

## Future Enhancements

- WhatsApp notification integration (Twilio/wa.me)
- File upload for payment receipts (Supabase Storage)
- Email notifications
- Payment gateway integration
- Advanced booking analytics
- Multi-image package galleries
- Package reviews and ratings

## License

MIT
