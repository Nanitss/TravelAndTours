# Wanderly - AI-Powered Travel Itinerary Generator

A modern, responsive web application for generating personalized travel itineraries using AI technology.

## 🚀 Features

- **AI-Powered Itinerary Generation**: Smart AI designs personalized travel itineraries
- **Firebase Authentication**: Secure login/signup with email and password
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Glassmorphism UI**: Modern frosted glass design effects
- **Real-time Form Validation**: Instant feedback on form inputs
- **Social Authentication Ready**: Prepared for Google, Facebook, and Apple login

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with Glassmorphism effects
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Analytics**: Firebase Analytics
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── HeroSection.tsx # Main hero with form
│   ├── SampleItineraries.tsx # Sample destination cards
│   └── AuthModal.tsx   # Login/signup modal
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── utils/              # Utility functions
│   └── firebase.ts     # Firebase configuration
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-and-tours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - The Firebase configuration is already set up with your credentials
   - Make sure Authentication is enabled in your Firebase console
   - Enable Email/Password authentication method

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application will automatically reload when you make changes

## 🔧 Firebase Setup

### Authentication Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `travelandtours-20d29`
3. Navigate to Authentication > Sign-in method
4. Enable Email/Password authentication
5. Optionally enable Google, Facebook, or Apple sign-in

### Firestore Database

1. Go to Firestore Database in Firebase Console
2. Create a database in production mode
3. Set up security rules for authenticated users

## 📱 Features Overview

### Header Component
- **Logo**: Wanderly branding with script font
- **Navigation**: Home, Premium, About Us links
- **Language Selector**: Multi-language support ready
- **Authentication**: Login/Signup buttons with user state

### Hero Section
- **Background**: Stunning tropical beach image
- **Form**: Glassmorphism itinerary generation form
- **Inputs**: Destination, dates, passengers, budget, custom prompt
- **Generate Button**: AI-powered itinerary creation

### Sample Itineraries
- **Boracay, Philippines**: Tropical beach destination
- **Tokyo, Japan**: Vibrant city experience
- **New York, USA**: Iconic landmarks and attractions

### Authentication Modal
- **Login Form**: Email and password authentication
- **Signup Form**: User registration with validation
- **Social Login**: Ready for Google, Facebook, Apple integration
- **Form Validation**: Real-time error handling

## 🎨 Design System

### Colors
- **Primary**: #00bcd4 (Cyan)
- **Secondary**: #0097a7 (Dark Cyan)
- **Background**: #f8f9fa (Light Gray)
- **Text**: #333 (Dark Gray)

### Typography
- **Logo**: Brush Script MT (Script font)
- **Headings**: Bold sans-serif
- **Body**: System font stack

### Effects
- **Glassmorphism**: Backdrop blur with transparency
- **Gradients**: Beautiful color transitions
- **Shadows**: Subtle depth and elevation
- **Animations**: Smooth hover and focus effects

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## 🔐 Security Features

- **Firebase Authentication**: Secure user management
- **Form Validation**: Client-side and server-side validation
- **Protected Routes**: Authentication-required pages
- **Error Handling**: Comprehensive error management

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

### Other Platforms

- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop build folder
- **AWS S3**: Upload build folder to S3 bucket

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build

```bash
# Create production build
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check Firebase documentation

## 🔄 Updates

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added social authentication
- **v1.2.0**: Enhanced UI/UX improvements
- **v1.3.0**: Mobile optimization

---

**Built with ❤️ using React, TypeScript, and Firebase**