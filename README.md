# Dyad Practice Solutions - Healthcare Portal

A modern, responsive React healthcare management application built with TypeScript, Tailwind CSS, and modern web technologies.

## Features

### Authentication & Security
- 🔐 Secure login and registration system
- 📧 Email OTP verification for new registrations
- 👥 Role-based access control (Admin/Client)
- 🛡️ JWT token-based authentication
- 🔒 Password protection with visibility toggle

### User Roles & Dashboards
- **Admin Dashboard**: Comprehensive management interface
  - User management and analytics
  - Claims processing and tracking
  - Contact us message management
  - Data visualization with charts
  - User distribution analytics

- **Client Dashboard**: Patient-focused interface
  - Appointment scheduling and management
  - Document upload and management
  - Billing and payment processing
  - Health metrics and activity tracking
  - Profile and settings management

### Key Features
- 📱 Fully responsive design for all mobile devices
- 🎨 Modern UI with Tailwind CSS
- 📊 Interactive charts and data visualization
- 📋 Form validation with Yup and React Hook Form
- 🔍 Advanced filtering and search functionality
- 📄 Document management system
- 💳 Billing and payment tracking
- 📅 Appointment management
- 🔔 Notification preferences
- 📞 Contact and support system

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **HTTP Client**: Axios (API integration ready)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthcare-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

### Demo Credentials

#### Admin Login
- **Email**: admin@example.com
- **Password**: any password (demo mode)
- **Role**: Admin
- **Redirect**: Admin Dashboard

#### Client Login
- **Email**: client@example.com  
- **Password**: any password (demo mode)
- **Role**: Client
- **Redirect**: Client Dashboard

#### Registration & OTP
- Complete the registration form with valid details
- Use OTP code: `123456` for email verification
- New users are assigned client role by default

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── admin/          # Admin-specific components
│   ├── client/         # Client-specific components
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── OTPVerification.tsx
├── types/              # TypeScript type definitions
│   └── auth.ts
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The application is fully integrated with REST APIs using the following endpoints:

### Authentication Endpoints
- `POST /api/send-email-otp` - Send OTP to email
- `POST /api/register` - Register new user
- `POST /api/login` - User authentication
- `POST /api/refresh` - Refresh access token
- `GET /api/profile` - Get user profile
- `GET /api/verify-email` - Verify email

### Key Features
- **JWT Authentication**: Secure token-based authentication
- **Auto Token Refresh**: Automatic token refresh on expiry
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Request Interceptors**: Automatic token injection
- **Response Interceptors**: Handle token refresh and errors

### Configuration
1. Copy `.env.example` to `.env`
2. Set your API URL: `VITE_API_URL=http://localhost:5000/api`
3. The application will automatically use the configured API endpoints

### Demo Mode
When API is unavailable, the application falls back to demo mode:
- Use OTP code: `123456` for testing
- Mock authentication for demonstration
- Full functionality preserved

For detailed API documentation, see `src/services/api-docs.md`

## Responsive Design

The application features:

- Mobile-first responsive design
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements
- Collapsible navigation for mobile
- Optimized performance for mobile devices

## Security Features

- Input validation and sanitization
- XSS protection
- Secure password handling
- Role-based access control
- Token-based authentication
- OTP verification system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:

- Email: support@dyadhealth.com
- Phone: 1-800-HEALTHCARE
- Documentation: Check the Help & Support section in the app

---

**Dyad Practice Solutions** - Modern Healthcare Management Platform
