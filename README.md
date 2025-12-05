# ELD Trip Planner - Frontend

A modern, responsive web application for planning trips with Electronic Logging Device (ELD) compliance. Built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### Trip Planning
- **Interactive Map**: Visualize routes with React Leaflet
- **Geocoding**: Search and select locations with autocomplete
- **Route Optimization**: Plan trips with multiple stops and waypoints
- **ELD Compliance**: Automatic Hours of Service (HOS) calculations

### Trip Details
- **Modern UI**: Clean, gamified interface with animations
- **Route Visualization**: Interactive map with route polylines
- **Turn-by-Turn Directions**: Detailed navigation steps with search
- **Achievement System**: Gamification badges for trip milestones
- **Statistics Dashboard**: Comprehensive trip metrics and summaries

### ELD Logs
- **24-Hour Log Graph**: Traditional ELD logbook visualization
- **Stepped Line Graph**: Visual representation of duty status changes
- **Activity Log**: Detailed remarks and location tracking
- **Compliance Monitoring**: Real-time HOS limit tracking
- **Day Navigation**: Browse logs across multiple days

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion 12.23.25
- **Maps**: React Leaflet 5.0.0 & Leaflet 1.9.4
- **State Management**: React Query (TanStack Query) 5.90.12
- **Routing**: React Router DOM 7.10.1
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React 0.555.0

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- Package manager: npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install

   # Using bun
   bun install
   ```

3. **Generate API client** (if API spec changes)
   ```bash
   npm run generate:api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── MapDisplay/     # Map visualization
│   │   ├── RouteSteps/     # Turn-by-turn directions
│   │   ├── LogGraph/       # ELD log visualization
│   │   └── ...
│   ├── views/              # Page components
│   │   ├── TripCreate.tsx  # Trip planning page
│   │   ├── TripDetails.tsx # Trip details page
│   │   └── LogView.tsx     # ELD logs viewer
│   ├── hooks/              # Custom React hooks
│   │   ├── useGeocoding.ts
│   │   ├── useTripPlan.ts
│   │   └── useTripDetails.ts
│   ├── lib/                # Utilities and API
│   │   ├── api/           # Generated API client
│   │   ├── animations.ts  # Framer Motion variants
│   │   ├── polyline.ts    # Polyline decoding
│   │   └── tripHelpers.ts # Data transformation helpers
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate:api` - Generate API client from OpenAPI spec

## 🎨 UI/UX Features

### Design Principles
- **Clean & Modern**: Minimal design with neutral colors
- **No Gradients**: Flat design aesthetic
- **No Shadows**: Clean, flat interface
- **Simple Typography**: Inter font family
- **Responsive**: Mobile-first approach

### Animations
- **Framer Motion**: Smooth transitions and micro-interactions
- **Staggered Lists**: Sequential item animations
- **Hover Effects**: Interactive feedback
- **Progress Indicators**: Visual progress tracking
- **Gamification**: Achievement badges and celebrations

## 🔌 API Integration

The application connects to a backend API. Configure the API base URL in:
```
src/lib/api/core/OpenAPI.ts
```

Default: `http://localhost:800`

### API Client Generation

The API client is generated from `eld-planner-api.yaml` using `openapi-typescript-codegen`.

To regenerate after API changes:
```bash
npm run generate:api
```

## 🗺️ Map Configuration

The application uses OpenStreetMap tiles via Leaflet. For production, consider:
- Using a map tile provider (Mapbox, MapTiler, etc.)
- Adding API keys to environment variables
- Configuring custom map styles

## 🎯 Key Components

### Trip Creation
- **TripForm**: Location input with geocoding
- **MapDisplay**: Interactive route visualization

### Trip Details
- **TripHero**: Hero section with key metrics
- **StatsCard**: Trip statistics
- **RouteSteps**: Turn-by-turn directions with search
- **AchievementBadges**: Gamification elements
- **TimelineSummary**: HOS compliance tracking

### ELD Logs
- **LogGraph**: 24-hour stepped line graph
- **LogGraphAnimated**: Animated log transitions
- **DayNavigator**: Day-by-day navigation
- **ProgressRing**: Circular progress indicators

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier (if configured) for formatting

### Component Guidelines
- Use shadcn/ui components for consistency
- Follow the existing component structure
- Implement responsive design
- Add Framer Motion animations where appropriate

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:800
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contributing guidelines here]

## 📞 Support

[Add support information here]

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [React Leaflet](https://react-leaflet.js.org/) for map integration
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev/) for icons
