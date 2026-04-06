
# LiveHub - Livestock Marketplace Platform

<img src="https://img.shields.io/badge/Node.js-18.0+-green" alt="Node.js"> <img src="https://img.shields.io/badge/Python-3.8+-blue" alt="Python"> <img src="https://img.shields.io/badge/MongoDB-5.0+-brightgreen" alt="MongoDB"> <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react" alt="React">

**LiveHub** is a modern livestock marketplace platform designed for farmers and buyers in India. It leverages AI-powered computer vision using YOLOv8 to analyze livestock health scores and provide intelligent recommendations.

---

## 🌟 Features

### For Farmers

- **List Livestock**: Upload details and images of animals for sale
- **Health Analysis**: AI-powered health scoring using YOLOv8 vision
- **Manage Listings**: Track and manage your active listings
- **Real-time Communication**: Direct messaging with potential buyers

### For Buyers

- **Browse Marketplace**: Search and filter livestock by type, price, location
- **Health Insights**: View AI-generated health scores and recommendations
- **Secure Transactions**: JWT-based authentication and secure payments
- **Mobile App**: Native iOS/Android app via React Native

### AI Features

- **YOLOv8 Object Detection**: Accurate animal detection and classification
- **Health Score Analysis**: Computer vision-based health assessment
- **MediaPipe Pose Estimation**: Body structure analysis
- **Image Clarity Evaluation**: Automatic image quality assessment

---

## 🏗️ Project Architecture

### Tech Stack

| Layer              | Technology                     |
| ------------------ | ------------------------------ |
| **Frontend**       | React 18 + Vite + Tailwind CSS |
| **Backend**        | Node.js + Express.js           |
| **Database**       | MongoDB (Local/Atlas)          |
| **AI Service**     | FastAPI + YOLOv8 + MediaPipe   |
| **Mobile**         | React Native + Expo            |
| **Authentication** | JWT + bcryptjs                 |

### Directory Structure

```
LiveHub/
├── backend/              # Express.js API server
│   ├── controllers/      # API endpoint handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/       # Auth, error handling, uploads
│   ├── config/          # Database and 3rd-party config
│   └── server.js        # Entry point
│
├── frontend/            # React + Vite web app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context & state
│   │   ├── api/         # Axios configuration
│   │   └── App.jsx      # Main app component
│   └── vite.config.js   # Vite configuration
│
├── ai-service/          # FastAPI AI service
│   ├── app.py           # FastAPI server with YOLOv8
│   ├── requirements.txt  # Python dependencies
│   ├── yolov8n.pt       # YOLO nano model (auto-downloaded)
│   └── test_logic.py    # Testing utilities
│
├── mobile/              # React Native mobile app
│   ├── screens/         # App screens
│   ├── App.js           # Entry point
│   └── app.json         # Expo config
│
└── seedDummyData.js     # Database seeding script
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** 5.0+ (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/livestock
JWT_SECRET=LiveHub_jwt_secret_2026_change_in_production
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:

```bash
npm run dev
```

**Backend runs on**: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

**AI Service runs on**: `http://localhost:8000`

### 4. Seed Test Data (Optional)

Populate the database with 5 test users and 5 livestock listings:

```bash
cd backend
node seedDummyData.js
```

### 5. Mobile App (Optional)

```bash
cd mobile
npm install
npx expo start
```

### Start Everything at Once

Run from the root directory:

```bash
./start_all.bat  # Windows
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Livestock

- `GET /api/livestock` - List all livestock
- `POST /api/livestock` - Create new listing
- `GET /api/livestock/:id` - Get livestock details
- `PUT /api/livestock/:id` - Update listing
- `DELETE /api/livestock/:id` - Delete listing

### Health Check

- `GET /api/health` - System health status

### Testimonials

- `GET /api/testimonials` - Fetch testimonials
- `POST /api/testimonials` - Add testimonial

### AI Analysis

- `POST /api/analyze` - Analyze livestock image with YOLOv8

---

## 🧠 AI Model Details

### YOLOv8 Nano (`yolov8n.pt`)

- **Lightweight model** optimized for speed
- **Real-time detection** of livestock animals
- **Pre-trained on COCO dataset** with 80 object classes
- Automatically downloads on first run (~6MB)

### Health Score Algorithm

1. **Image Clarity**: Laplacian variance analysis (0-100)
2. **Detection Confidence**: YOLOv8 confidence score
3. **Pose Analysis**: MediaPipe skeletal tracking
4. **Final Score**: Weighted combination (0-100)

---

## 🔐 Authentication

JWT-based authentication with bcryptjs password hashing:

- **Tokens expire** in 7 days
- **Secure endpoints** require valid JWT in Authorization header
- **Role-based access**: Farmer/Buyer roles for feature access

```bash
Authorization: Bearer <JWT_TOKEN>
```

---

## 🗄️ Database Schema

### User Model

```javascript
{
  name, email, password, role, phone, address, city, state;
}
```

### Livestock Model

```javascript
{
  owner,
    breed,
    age,
    price,
    description,
    image,
    healthScore,
    location,
    contact,
    postedAt;
}
```

### Testimonial Model

```javascript
{
  author, rating, message, createdAt;
}
```

---

## 📦 Dependencies

### Backend

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `multer` - File uploads
- `cloudinary` - Image storage

### Frontend

- `react` - UI library
- `vite` - Build tool
- `tailwindcss` - Styling
- `axios` - HTTP client
- `react-router-dom` - Routing
- `framer-motion` - Animations

### AI Service

- `fastapi` - Web framework
- `ultralytics` - YOLOv8
- `mediapipe` - Pose estimation
- `opencv-python` - Image processing
- `numpy` - Numerical computing

---

## 🧪 Testing

Run the seed script to populate test data:

```bash
node backend/seedDummyData.js
```

Test credentials:

- **Email**: farmer1@example.com, farmer2@example.com, etc.
- **Password**: password123

---

## 🛠️ Development

### Environment Variables

All services use `.env` files for configuration. See `.env.example` files in each service directory.

### Hot Reload

- **Backend**: `npm run dev` (Nodemon)
- **Frontend**: `npm run dev` (Vite)
- **AI Service**: Auto-reloads with FastAPI

### Debugging

- **Backend**: Use VS Code debugger with Node.js
- **Frontend**: Chrome DevTools
- **AI Service**: FastAPI interactive docs at `http://localhost:8000/docs`

---

## 📱 Mobile App

Built with React Native and Expo:

- Cross-platform iOS & Android
- Deep linking support
- Camera integration for livestock photos
- Real-time notifications

Run with: `npx expo start`

---

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Windows
Get-Process -Id <PID> | Stop-Process -Force

# Or change ports in .env files
```

### MongoDB Connection Failed

Ensure MongoDB is running:

```bash
# Windows
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env
```

### AI Service Not Responding

Check YOLOv8 model download:

```bash
cd ai-service
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

---

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

## 👥 Contributors

Built by the LiveHub team. Contributions welcome!

---

## 📞 Support

For issues and questions:

- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error logs and environment info

---

**Happy farming and trading on LiveHub! 🐄🐑🐐**
