# PocketJustice

**Your Rights, Instantly Accessible.**

PocketJustice is a mobile-first web application that provides instant access to 'know your rights' information and documentation tools for interactions with law enforcement. Built with React, Vite, and modern web technologies.

## 🚀 Features

### Core Features
- **📱 Mobile-First Design**: Optimized for quick access during high-stress situations
- **📚 Legal Guides**: Comprehensive, easy-to-digest guides for common law enforcement interactions
- **🎙️ One-Tap Recording**: Discreet audio/video recording with secure storage
- **🌍 State-Specific Content**: Location-aware legal information tailored to your jurisdiction
- **🗣️ Multilingual Support**: Available in English and Spanish with more languages coming
- **📝 Scripted Responses**: Pre-written, effective phrases for de-escalation

### Premium Features
- **☁️ IPFS Backup**: Decentralized, tamper-proof storage via Pinata
- **📴 Offline Access**: Download guides for offline use
- **🎥 Video Recording**: Full audio/video recording capabilities
- **🏛️ State-Specific Deep Dives**: Detailed jurisdiction-specific legal information
- **🔒 Enhanced Security**: End-to-end encryption for recordings
- **⚡ Priority Support**: Direct access to legal experts

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Payments**: Stripe
- **Storage**: IPFS via Pinata
- **AI**: OpenAI GPT for content generation
- **State Management**: React Context + useReducer
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-4284.git
   cd this-is-a-4284
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   VITE_OPENAI_API_KEY=sk-your_openai_key
   VITE_PINATA_API_KEY=your_pinata_key
   VITE_PINATA_SECRET_API_KEY=your_pinata_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── GuideCard.jsx
│   ├── RecordingButton.jsx
│   ├── SubscriptionModal.jsx
│   ├── AlertBar.jsx
│   └── LanguageSelector.jsx
├── contexts/           # React contexts
│   └── UserContext.jsx
├── hooks/              # Custom React hooks
│   ├── useRecording.js
│   ├── useLocation.js
│   └── useContentGeneration.js
├── services/           # API services
│   └── api.js
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Colors**: Purple/blue gradient theme with semantic color tokens
- **Typography**: Clear hierarchy with accessible font sizes
- **Spacing**: Consistent 8px grid system
- **Components**: Modular, reusable components with variants
- **Motion**: Smooth transitions with appropriate easing

### Design Tokens
```css
:root {
  --color-bg: hsl(0 0% 100%);
  --color-accent: hsl(203 92% 51%);
  --color-primary: hsl(220 89% 46%);
  --color-surface: hsl(220 13% 14%);
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-sm: 4px;
  --spacing-lg: 24px;
  --spacing-md: 16px;
  --spacing-sm: 8px;
}
```

## 🔧 API Integration

### Stripe Payments
```javascript
import { stripeService } from './services/api'

// Create subscription
const subscription = await stripeService.createSubscription(priceId, customerId)
```

### IPFS Storage
```javascript
import { pinataService } from './services/api'

// Upload file to IPFS
const result = await pinataService.uploadFile(file, metadata)
```

### OpenAI Content Generation
```javascript
import { openaiService } from './services/api'

// Generate legal content
const content = await openaiService.generateContent(prompt, 'guide')
```

## 📱 Mobile Features

- **PWA Ready**: Installable as a Progressive Web App
- **Offline Support**: Core functionality works without internet
- **Touch Optimized**: Large touch targets and gesture support
- **Camera Integration**: Access to device camera for video recording
- **Geolocation**: Automatic location detection for state-specific content

## 🔒 Security & Privacy

- **Local Storage**: Sensitive data stored locally when possible
- **Encryption**: Recordings encrypted before IPFS upload
- **No Tracking**: Privacy-first approach with minimal data collection
- **Secure APIs**: All API communications over HTTPS
- **IPFS Backup**: Decentralized storage prevents censorship

## 🌍 Internationalization

Currently supports:
- **English (en)**: Full feature set
- **Spanish (es)**: Complete translation

Adding new languages:
1. Add language code to `VITE_SUPPORTED_LANGUAGES`
2. Create translation files
3. Update `SCRIPTED_RESPONSES` object
4. Test with OpenAI translation service

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```bash
docker build -t pocketjustice .
docker run -p 3000:3000 pocketjustice
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: < 500KB gzipped
- **First Paint**: < 1.5s on 3G
- **Interactive**: < 3s on mobile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.pocketjustice.app](https://docs.pocketjustice.app)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-4284/issues)
- **Email**: support@pocketjustice.app
- **Discord**: [Join our community](https://discord.gg/pocketjustice)

## 🙏 Acknowledgments

- **Legal Experts**: For reviewing and validating legal content
- **Civil Rights Organizations**: For guidance on best practices
- **Open Source Community**: For the amazing tools and libraries
- **Beta Testers**: For invaluable feedback and testing

---

**⚖️ Disclaimer**: This app provides general legal information and should not be considered legal advice. Always consult with a qualified attorney for specific legal situations.

**🚨 Emergency**: If you're in immediate danger, call 911 or your local emergency services.

---

Made with ❤️ for justice and civil rights.
