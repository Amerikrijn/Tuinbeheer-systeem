# 🌿 Tuinbeheer Systeem (Garden Management System)

A comprehensive, modern garden management system with interactive visual garden designer, built with Next.js, TypeScript, and Supabase.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🎯 Project Overview

The **Tuinbeheer Systeem** is a modern web application designed to help gardeners, landscapers, and garden enthusiasts manage their gardens digitally. The system provides an intuitive, visual-first approach to garden planning and management.

### ✨ Key Features

- **🎨 Interactive Visual Garden Designer**: Canvas-based drag-and-drop garden planning
- **🌱 Plant Bed Management**: Create, organize, and track garden sections
- **📊 Comprehensive Plant Database**: 150+ Dutch flowers and plants with detailed information
- **⚡ Real-time Updates**: Live synchronization with Supabase database
- **📱 Mobile-First Design**: Responsive interface optimized for all devices
- **🔄 Collaboration Tools**: Real-time multi-user editing capabilities

### 🖼️ Screenshots

| Feature | Preview |
|---------|---------|
| **Visual Garden Designer** | ![Visual Designer](docs/assets/screenshots/visual-designer.png) |
| **Plant Bed Management** | ![Plant Management](docs/assets/screenshots/plant-management.png) |
| **Mobile Interface** | ![Mobile Interface](docs/assets/screenshots/mobile-interface.png) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or later
- pnpm (recommended) or npm
- Supabase account

### Installation

```bash
# 1. Clone the repository
git clone [repository-url]
cd garden-management-system

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Configure Supabase
# Follow the Supabase CLI installation guide

# 5. Start development server
npm run dev
```

🎉 **That's it!** Your garden management system is now running at `http://localhost:3000`

### 🎮 Try the Demo

- **Visual Garden Designer**: `http://localhost:3000/visual-garden-demo`
- **Plant Bed Management**: `http://localhost:3000/plant-beds`
- **Garden Layout**: `http://localhost:3000/plant-beds/layout`

## 📚 Documentation

### 👥 For Different User Types

| User Type | Documentation | Description |
|-----------|---------------|-------------|
| **🏠 End Users** | [User Guide](docs/guides/users/README.md) | Complete user manual with screenshots and tutorials |
| **🏗️ Architects** | [Architecture Guide](docs/guides/architects/README.md) | System design, technical architecture, and patterns |
| **💼 Business Analysts** | [Business Guide](docs/guides/business-analysts/README.md) | Requirements, processes, and business value |
| **🛠️ Developers** | [Developer Guide](docs/guides/developers/README.md) | Technical setup, API docs, and development practices |

### 🔧 Setup & Configuration

| Topic | Documentation | Description |
|-------|---------------|-------------|
| **Environment Setup** | [Environment Guide](docs/setup/environment-setup.md) | Complete environment configuration |
| **Database Setup** | [Database Guide](docs/setup/database-setup.md) | Supabase configuration and schema |
| **Deployment** | [Deployment Guide](docs/setup/deployment.md) | Production deployment instructions |
| **Troubleshooting** | [Troubleshooting Guide](docs/setup/troubleshooting.md) | Common issues and solutions |

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **HTML5 Canvas**: Interactive garden designer

### Backend
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Row Level Security**: Database-level access control
- **Real-time Subscriptions**: Live data synchronization
- **RESTful API**: Standard HTTP API endpoints

### DevOps
- **Vercel**: Serverless deployment platform
- **GitHub Actions**: CI/CD pipeline
- **ESLint & Prettier**: Code quality and formatting

## 🌟 Key Capabilities

### 🎨 Visual Garden Designer
- **Canvas-based Interface**: Intuitive drag-and-drop design
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Precision Tools**: Grid snapping, zoom controls, and measurements
- **Auto-save**: Changes are automatically saved to the database

### 🌱 Plant Management
- **Plant Database**: Comprehensive Dutch plant information
- **Growth Tracking**: Monitor plant development over time
- **Seasonal Planning**: Plan activities by season and plant type
- **Care Reminders**: Automated notifications for plant care

### 📊 Analytics & Reporting
- **Garden Statistics**: Track garden productivity and health
- **Growth Analytics**: Monitor plant development patterns
- **Usage Reports**: Understand how your garden space is utilized
- **Export Capabilities**: Generate reports and export data

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
npm run dev                     # Start development server
npm run build                   # Build for production
npm run start                   # Start production server

# Code Quality
npm run lint                    # Run ESLint
npm run type-check              # TypeScript type checking
npm run format                  # Format code with Prettier
npm run lint:fix                # Fix linting issues
```

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📁 Project Structure

```
garden-management-system/
├── 📁 app/                    # Next.js app directory
│   ├── 📁 plant-beds/        # Plant bed management
│   ├── 📁 visual-garden-demo/ # Visual designer
│   └── 📁 api/               # API routes
├── 📁 components/            # React components
│   ├── 📁 ui/               # Base UI components
│   ├── 📁 plant-beds/       # Plant bed components
│   └── 📁 visual-garden-designer/ # Canvas components
├── 📁 lib/                   # Utility libraries
├── 📁 docs/                  # Documentation
│   ├── 📁 guides/           # User guides
│   ├── 📁 setup/            # Setup documentation
│   └── 📁 assets/           # Images and resources
├── 📁 scripts/              # Automation scripts
├── 📁 supabase-sql-scripts/ # Database scripts
└── 📁 public/               # Static assets
```

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/garden-management-system)

### Manual Deployment

```bash
# 1. Build the application
pnpm run build

# 2. Set up environment variables in your deployment platform
# 3. Deploy using your preferred method (Vercel, Netlify, etc.)

# For Vercel CLI
vercel --prod
```

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔐 Security

- **Row Level Security**: Database-level access control
- **Environment Variables**: Secure credential management
- **Input Validation**: Comprehensive data validation
- **Authentication**: Secure user authentication via Supabase Auth

## 📈 Performance

- **Server-side Rendering**: Fast initial page loads
- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Automatic image compression
- **Canvas Optimization**: Efficient visual rendering

## 🌍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase**: For providing an excellent backend-as-a-Service platform
- **Next.js Team**: For the amazing React framework
- **shadcn/ui**: For beautiful and accessible UI components
- **Vercel**: For seamless deployment and hosting

## 🆘 Support

### Getting Help

- **📖 Documentation**: Check the [docs](docs/) folder for comprehensive guides
- **🐛 Issues**: Report bugs via [GitHub Issues](../../issues)
- **💬 Discussions**: Join our [GitHub Discussions](../../discussions)
- **📧 Email**: Contact us at [support@tuinbeheer.com](mailto:support@tuinbeheer.com)

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check [Environment Setup](docs/setup/environment-setup.md) |
| Visual designer not loading | See [Troubleshooting Guide](docs/setup/troubleshooting.md) |
| Build errors | Review [Developer Guide](docs/guides/developers/README.md) |

## 🗺️ Roadmap

### Current Version (v1.1.0)
- ✅ Visual Garden Designer
- ✅ Plant Bed Management
- ✅ Mobile Responsive Design
- ✅ Real-time Collaboration

### Next Release (v1.2.0)
- 🔄 Advanced Plant Database
- 🔄 Weather Integration
- 🔄 Plant Care Reminders
- 🔄 Garden Analytics

### Future Plans (v2.0.0)
- 🔮 AI-powered Plant Recommendations
- 🔮 Mobile App (React Native)
- 🔮 Community Features
- 🔮 E-commerce Integration

---

<div align="center">

**🌿 Made with ❤️ by the Tuinbeheer Team**

[![GitHub stars](https://img.shields.io/github/stars/your-org/garden-management-system?style=social)](https://github.com/your-org/garden-management-system)
[![GitHub forks](https://img.shields.io/github/forks/your-org/garden-management-system?style=social)](https://github.com/your-org/garden-management-system)
[![GitHub issues](https://img.shields.io/github/issues/your-org/garden-management-system)](https://github.com/your-org/garden-management-system/issues)

**Ready for production deployment!** 🚀

</div>
