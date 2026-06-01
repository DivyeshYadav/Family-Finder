# Family Finder 👨‍👩‍👧‍👦

Find your family members through relationship mapping, not location tracking.

## Features ✨

- **Register & Login** - Secure authentication with JWT
- **Create/Edit Profile** - Add your profile picture and bio
- **Family Tree Editor** - Add, edit, and delete family members
- **Smart Matching** - Automatically finds potential family members when you share 3+ family members
- **Face Recognition** - Bonus face matching when profile pictures are available
- **Real-time Notifications** - Get notified when matches are found
- **View Profiles** - Check other users' profiles from notifications

## Tech Stack 🛠️

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Security:** JWT, bcryptjs

## Installation 📦

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DivyeshYadav/Family-Finder.git
   cd Family-Finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file** with your MongoDB URI and JWT secret
   ```
   MONGODB_URI=mongodb://localhost:27017/family-finder
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

7. **Open in browser**
   - Visit `http://localhost:5000`
   - Or use Live Server for `public/index.html`

## How It Works 🔍

1. **Register** - Create your account
2. **Create Profile** - Add your details and upload a photo
3. **Add Family Members** - Build your family tree
4. **Get Matched** - System automatically finds people with 3+ matching family members
5. **View Profiles** - Click on notifications to see other profiles

## Project Structure 📁

```
Family-Finder/
├── models/User.js              # User database schema
├── routes/                     # API routes
│   ├── auth.js                # Authentication
│   ├── profile.js             # Profile management
│   ├── family.js              # Family tree operations
│   └── notifications.js       # Notifications
├── middleware/auth.js         # JWT authentication
├── services/                  # Business logic
│   ├── matchingService.js     # Family matching algorithm
│   └── faceRecognitionService.js # Face comparison
├── public/                    # Frontend files
│   ├── index.html            # Main page
│   ├── styles.css            # Styling
│   └── app.js                # Frontend logic
├── server.js                 # Main server file
├── package.json              # Dependencies
└── .env.example              # Environment template
```

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `POST /api/profile/create-or-update` - Create/update profile
- `GET /api/profile/get/:userId` - Get user profile

### Family Tree
- `POST /api/family/add-member` - Add family member
- `PUT /api/family/edit-member/:memberId` - Edit family member
- `DELETE /api/family/delete-member/:memberId` - Delete family member
- `GET /api/family/get-tree` - Get family tree

### Notifications
- `GET /api/notifications/get` - Get all notifications
- `PUT /api/notifications/mark-read/:notificationId` - Mark as read
- `POST /api/notifications/check-matches` - Check for new matches

## Development 🚀

For live development with auto-reload:
```bash
npm run dev
```

Requires `nodemon` (included in devDependencies)

## Deployment 🌐

Recommended platforms:
- **Replit** - Easiest, built-in MongoDB
- **Railway** - Simple Node.js deployment
- **Heroku** - Traditional deployment
- **Vercel** (frontend only)

## License 📄

MIT

## Author ✍️

Divyesh Yadav
