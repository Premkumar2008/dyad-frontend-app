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

## Zoho Pay — ACH Mandate (Onboarding Step 6)

Based on Zoho Payments OpenAPI (`customers.yml`, `payment-method-session.yml`, `payment-session.yml`).

**Zoho base URL:** `https://payments.zoho.com/api/v1`  
**Widget script:** `https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js`  
**OAuth scopes:** `ZohoPay.customers.CREATE`, `ZohoPay.paymentmethods.CREATE`, `ZohoPay.paymentmethods.READ`

### End-to-end flow (recommended — save ACH payment method)

1. **Frontend** → `POST /api/zoho-pay/ach-mandate/setup`
2. **Backend** → Zoho `POST /customers?account_id={id}` (name + email required)
3. **Backend** → Zoho `POST /paymentmethodsessions?account_id={id}` with `{ customer_id, description }`
4. **Backend** → return session IDs to frontend
5. **Frontend** → embedded widget `requestPaymentMethod({ payment_method: "ach_debit", transaction_type: "add", customer_id, payment_method_session_id })`
6. **Frontend** → `POST /api/zoho-pay/ach-mandate/confirm` with `payment_method_session_id`
7. **Backend** → Zoho `GET /paymentmethodsessions/{payment_method_session_id}?account_id={id}` — verify `status: succeeded` and `payment_method.type: ach_debit`

### Setup session
**Dyad endpoint:** `POST /api/zoho-pay/ach-mandate/setup`

**Request body:**
```json
{
  "email": "signer@practice.com",
  "name": "Jane Doe",
  "phone": "+15551234567",
  "onboardingId": "ob_abc123",
  "description": "Dyad onboarding ACH mandate · ob_abc123"
}
```

**Backend Zoho calls:**

`POST https://payments.zoho.com/api/v1/customers?account_id=23137556`
```json
{ "name": "Jane Doe", "email": "signer@practice.com", "phone": "+15551234567" }
```

`POST https://payments.zoho.com/api/v1/paymentmethodsessions?account_id=23137556`
```json
{ "customer_id": "1987000000724207", "description": "Dyad onboarding ACH mandate · ob_abc123" }
```

**Response to frontend** (OpenAPI shape — nested or flat both accepted):
```json
{
  "payment_method_session": {
    "payment_method_session_id": "1987000000724209",
    "customer_id": "1987000000724207",
    "description": "Dyad onboarding ACH mandate · ob_abc123",
    "created_time": 1708950672
  }
}
```

### Confirm mandate
**Dyad endpoint:** `POST /api/zoho-pay/ach-mandate/confirm`

**Request body:**
```json
{
  "onboardingId": "ob_abc123",
  "customer_id": "1987000000724207",
  "payment_method_id": "1987000000724215",
  "payment_method_session_id": "1987000000724209"
}
```

**Backend Zoho call:**

`GET https://payments.zoho.com/api/v1/paymentmethodsessions/1987000000724209?account_id=23137556`

**Response to frontend** (when session succeeded):
```json
{
  "payment_method_session": {
    "payment_method_session_id": "1987000000724209",
    "customer_id": "1987000000724207",
    "status": "succeeded",
    "payment_method": {
      "payment_method_id": "1987000000724215",
      "type": "ach_debit",
      "status": "active",
      "created_time": 1708950672
    }
  }
}
```

The frontend stores `payment_method_id` as the mandate reference in onboarding state.

### Alternate flow — payment session + checkout widget

Use when collecting an initial ACH payment instead of saving a payment method:

1. Backend → `POST /paymentsessions?account_id={id}` with `amount`, `currency`, `description`, and `configurations.allowed_payment_methods: ["ach_debit"]`
2. Frontend widget → `requestPaymentMethod({ transaction_type: "payment", payments_session_id, amount, currency_code, ... })`
3. Backend confirm → `GET /paymentsessions/{payments_session_id}?account_id={id}` to verify payment status

### Frontend environment variables
```env
VITE_ZOHO_PAY_ACCOUNT_ID=your_account_id
VITE_ZOHO_PAY_API_KEY=your_widget_api_key_from_developers_space
VITE_ZOHO_PAY_DOMAIN=US
VITE_ZOHO_PAY_USE_MOCK=false
```

Set `VITE_ZOHO_PAY_USE_MOCK=true` only for local UI testing without Zoho credentials.

### Backend example implementation

See `backend-examples/zoho-pay-ach-mandate.js` — mount at `/api/zoho-pay` on your Express server, or run standalone:

```bash
node backend-examples/zoho-pay-ach-mandate.js
```

Server env vars: `ZOHO_PAY_ACCOUNT_ID`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`

### Recurring charges (post-enrollment)

After onboarding saves `zohoCustomerId` + `zohoPaymentMethodId`, charge monthly fees server-side:

`POST /api/zoho-pay/ach-mandate/charge` → Zoho `POST /payments` with saved `payment_method_id` and `customer_id` (see `payments.yml`).

TypeScript OpenAPI-aligned types: `src/types/zohoPayApi.ts`

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
