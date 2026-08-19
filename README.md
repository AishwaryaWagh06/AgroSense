# 🌾 AgroSense - Smart Irrigation & Agronomy Assistant

A comprehensive agricultural management system that combines AI-powered chatbot assistance, crop prediction algorithms, and weather monitoring to help farmers make data-driven decisions for optimal crop yield and resource management.

## 🚀 Features

### 🤖 AI Chatbot Assistant
- **Multi-language Support**: English and Hindi language support
- **Image Analysis**: Upload plant/crop images for visual disease detection and analysis
- **Agricultural Expertise**: Specialized knowledge base for farming practices, pest control, and crop management
- **Secure API Integration**: Server-side Google Gemini API integration for secure AI processing

### 📊 Crop Yield Prediction
- **Machine Learning Models**: Random Forest regression for accurate yield predictions
- **Data-Driven Insights**: Analysis of historical crop data and environmental factors
- **Real-time Predictions**: Dynamic yield estimation based on current conditions

### 🌤️ Weather Monitoring
- **Real-time Weather Data**: Current weather conditions and forecasts
- **Agricultural Metrics**: Temperature, humidity, rainfall, and wind speed monitoring
- **Farming Recommendations**: Weather-based farming suggestions

### 📱 User-Friendly Interface
- **Modern Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Dashboard**: Comprehensive overview of farm metrics and predictions
- **Secure Authentication**: User login and registration system

## 🏗️ Project Structure

```
AgroSense/
├── 📁 auth-app/                 # Authentication module
├── 📁 assets/                   # Static assets (images, icons)
├── 📁 Dataset/                  # Crop dataset files
├── 📁 scripts/                  # JavaScript utilities
├── 📁 .vscode/                  # VS Code configuration
├── 📄 index.html                # Main landing page
├── 📄 login.html                # User authentication
├── 📄 dashboard.html            # Main dashboard
├── 📄 chatbot2.html             # AI chatbot interface
├── 📄 prediction.html           # Crop prediction interface
├── 📄 weather.html              # Weather monitoring
├── 📄 about.html                # About page
├── 📄 contact.html              # Contact page
├── 📄 styles.css                # Main stylesheet
├── 📄 server.js                 # Node.js frontend server
├── 📄 chatbot_server.py         # Python Flask backend
├── 📄 requirements.txt          # Python dependencies
├── 📄 package.json              # Node.js dependencies
└── 📄 Crop_recommendation.csv   # Crop dataset
```

## 🛠️ Technology Stack

### Frontend
- **HTML5 & CSS3**: Modern semantic markup and responsive styling
- **JavaScript (ES6+)**: Interactive client-side functionality
- **Node.js**: Static file serving and development server
- **TailwindCSS**: Utility-first CSS framework (if implemented)

### Backend
- **Python 3.8+**: Core backend language
- **Flask**: Lightweight web framework for API endpoints
- **Flask-CORS**: Cross-origin resource sharing support
- **Google Generative AI**: AI chatbot functionality via Gemini API

### Machine Learning
- **scikit-learn**: Machine learning algorithms and data preprocessing
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **Random Forest**: Crop yield prediction model

### Data & APIs
- **Kaggle API**: Dataset management and updates
- **OpenWeatherMap**: Weather data integration
- **Google Gemini AI**: Natural language processing and image analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **Python 3.8+**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VinayakKamankar1/Agro-Sense-.git
   cd AgroSense/Cursor
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (optional)
   - Create a `.env` file for API keys
   - Add your Google Gemini API key

### Running the Application

1. **Start the frontend server**
   ```bash
   npm start
   ```
   - Frontend will be available at `http://localhost:3000`
   - Default page: `http://localhost:3000/login.html`

2. **Start the backend server** (in a new terminal)
   ```bash
   python chatbot_server.py
   ```
   - Backend API will be available at `http://localhost:5000`
   - Chatbot endpoint: `http://localhost:5000/api/chat`

3. **Access the application**
   - Open your browser and navigate to `http://localhost:3000/login.html`
   - Register/login to access the dashboard

## 📡 API Documentation

### Chatbot API
**Endpoint**: `POST /api/chat`

**Request Body**:
```json
{
  "prompt": "Your agricultural question here",
  "lang": "en", // or "hi" for Hindi
  "image": "base64_encoded_image_data" // optional
}
```

**Response**:
```json
{
  "success": true,
  "response": "AI-generated agricultural advice"
}
```

### Crop Prediction API
**Endpoint**: `POST /api/predict`

**Request Body**:
```json
{
  "features": {
    "temperature": 25.5,
    "humidity": 65,
    "rainfall": 120,
    "soil_type": "loamy",
    "crop_type": "wheat"
  }
}
```

**Response**:
```json
{
  "success": true,
  "prediction": {
    "yield": 85.2,
    "confidence": 0.92,
    "recommendations": ["Increase irrigation", "Add nitrogen fertilizer"]
  }
}
```

## 🌐 Key Features in Detail

### 🤖 AI Chatbot
- **Specialized Agricultural Knowledge**: Trained on farming best practices, crop diseases, pest control, and sustainable agriculture
- **Image Recognition**: Upload photos of crops for disease detection and health assessment
- **Multi-language Support**: Communicate in English or Hindi for better accessibility
- **Context-Aware Responses**: Maintains conversation context for follow-up questions

### 📊 Crop Yield Prediction
- **Data-Driven Models**: Uses historical crop data and environmental factors
- **Real-time Analysis**: Considers current weather conditions and soil parameters
- **Confidence Scoring**: Provides prediction reliability metrics
- **Actionable Recommendations**: Suggests specific farming actions based on predictions

### 🌤️ Weather Integration
- **Current Conditions**: Real-time temperature, humidity, rainfall data
- **Forecast Analysis**: 7-day weather predictions for planning
- **Agricultural Alerts**: Weather-based farming recommendations and warnings
- **Historical Data**: Weather pattern analysis for long-term planning

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Weather API
WEATHER_API_KEY=your_openweathermap_api_key_here

# Server Configuration
FLASK_ENV=development
PORT=5000
```

### Dataset Setup
1. Place crop datasets in the `Dataset/` directory
2. Update `Crop_recommendation.csv` with your local crop data
3. Use `download_kaggle_dataset.py` to fetch updated datasets

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the powerful language model
- **Kaggle** for agricultural datasets
- **OpenWeatherMap** for weather data API
- **scikit-learn** for machine learning tools
- **Flask** for the backend framework

## 📞 Contact

- **Project Maintainer**: Vinayak Kamankar
- **GitHub**: [@VinayakKamankar1](https://github.com/VinayakKamankar1)
- **Email**: [your-email@example.com]

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app development (React Native)
- [ ] IoT sensor integration for real-time field monitoring
- [ ] Advanced disease detection using computer vision
- [ ] Multi-crop rotation planning
- [ ] Market price integration and profit optimization
- [ ] Community features for farmer collaboration

### Technical Improvements
- [ ] Database integration for user data persistence
- [ ] Enhanced security with JWT authentication
- [ ] API rate limiting and caching
- [ ] Automated testing and CI/CD pipeline
- [ ] Docker containerization for easy deployment

---

**🌱 Empowering farmers with technology for sustainable agriculture** 🚜
