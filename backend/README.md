# RapidSoS Backend

## Quickstart
1. Copy `.env.example` to `.env` and fill values
2. Start MongoDB locally or provide a connection string
3. Install deps and run

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:4000` by default.

### Health
GET `/api/health` → `{ ok: true }`

### POST /api/users/init
- Upsert user profile by `phone` (E.164). Does not set `phoneVerified`.
- Body example:
```json
{
  "phone": "+91XXXXXXXXXX",
  "name": { "first": "John", "middle": "K", "last": "Doe" },
  "dob": "2003-04-25",
  "bloodGroup": "O+",
  "allergies": ["Penicillin"],
  "medicalConditions": ["Asthma"],
  "medications": ["Salbutamol"],
  "specialNeeds": ["Hearing aid"],
  "emergencyContacts": [
    { "name": "Jane Doe", "relationship": "Sister", "phone": "+91XXXXXXXXXX", "email": "jane@example.com" }
  ],
  "homeAddress": "221B Baker Street, Delhi",
  "photoUrl": "https://res.cloudinary.com/.../photo.jpg"
}
```
- Response:
```json
{ "user": { "...": "persisted user doc with phoneVerified flag" } }
```

### POST /api/otp/verify-phone
- Verify Twilio Verify 6-digit code and set `phoneVerified` true on success.
- Body:
```json
{ "phone": "+91XXXXXXXXXX", "code": "123456" }
```
- Success 200:
```json
{ "approved": true, "status": "approved" }
```
- Failure 400:
```json
{ "approved": false, "status": "pending", "error": "Invalid or expired code" }
```
