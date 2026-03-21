# API Integration Documentation

This document outlines the API endpoints integrated into the Dyad Practice Solutions healthcare application.

## Base Configuration

- **Base URL**: `http://localhost:8000/api` (configurable via `REACT_APP_API_URL`)
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Authentication Flow

1. **Send OTP**: User requests OTP during registration
2. **Register**: Complete registration with OTP verification
3. **Login**: Authenticate with email/password
4. **Token Refresh**: Automatically refresh expired tokens

## API Endpoints

### 1. Send Email OTP
**Endpoint**: `POST /api/send-email-otp`

**Description**: Sends a one-time password to the user's email for registration verification.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "OTP sent to email"
}
```

**Status Codes**:
- `200`: OTP sent successfully
- `500`: Server error

---

### 2. Register User
**Endpoint**: `POST /api/register`

**Description**: Registers a new user with OTP verification.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "npi": "1234567890",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "message": "User registered successfully"
}
```

**Status Codes**:
- `200`: Registration successful
- `400`: Bad request (invalid data)
- `500`: Server error

---

### 3. Login
**Endpoint**: `POST /api/login`

**Description**: Authenticates user and returns JWT tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "accessToken": "jwt_token_here",
  "refreshToken": "jwt_token_here"
}
```

**Status Codes**:
- `200`: Login successful
- `401`: Invalid credentials
- `403`: Account disabled/blocked
- `500`: Server error

---

### 4. Refresh Access Token
**Endpoint**: `POST /api/refresh`

**Description**: Refreshes an access token using a refresh token.

**Request Body**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response**:
```json
{
  "accessToken": "new_jwt_token_here"
}
```

**Status Codes**:
- `200`: Token refreshed successfully
- `401`: Invalid refresh token
- `403`: Refresh token expired

---

### 5. Get User Profile
**Endpoint**: `GET /api/profile`

**Description**: Retrieves the authenticated user's profile information.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role": "client"
}
```

**Status Codes**:
- `200`: Profile retrieved successfully
- `401`: Unauthorized (invalid/expired token)

---

### 6. Verify Email
**Endpoint**: `GET /api/verify-email`

**Description**: Verifies email using a verification token.

**Query Parameters**:
```
?token=verification_token_here
```

**Response**:
```
Email verified successfully
```

**Status Codes**:
- `200`: Email verified successfully
- `400`: Invalid/expired token

## Implementation Details

### Token Management
- **Access Token**: Short-lived (15-30 minutes)
- **Refresh Token**: Long-lived (7-30 days)
- **Storage**: LocalStorage (consider HttpOnly cookies for production)

### Error Handling
The application includes comprehensive error handling:
- Network errors
- Authentication errors
- Validation errors
- Server errors

All errors are user-friendly with appropriate messages.

### Auto-Refresh
The application automatically refreshes access tokens when:
- API call returns 401 (Unauthorized)
- Valid refresh token is available
- Refresh fails → User is logged out

### Security Features
- JWT token authentication
- Automatic token refresh
- Secure storage practices
- Request/response interceptors
- Error boundary handling

## Usage Examples

### Login Example
```typescript
import { login } from '../services/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login({ email, password });
    const { accessToken, refreshToken } = response.data;
    
    // Tokens are automatically stored in AuthContext
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Protected API Call Example
```typescript
import { getUserProfile } from '../services/api';

const fetchProfile = async () => {
  try {
    const response = await getUserProfile();
    console.log('User profile:', response.data);
  } catch (error) {
    console.error('Failed to fetch profile:', error.message);
  }
};
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

For production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Testing

The application includes demo mode functionality:
- OTP: `123456` (for testing)
- Mock API responses when backend is unavailable
- Graceful fallback to demo mode

## Next Steps

1. Set up your backend API server
2. Configure the API URL in environment variables
3. Test all endpoints
4. Implement additional endpoints as needed
5. Add comprehensive logging and monitoring
