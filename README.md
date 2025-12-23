# 🩸 LifeLink - Blood Donor Finder

A modern, accessible web application connecting blood donors with recipients in need. Built with Next.js 16, React 19, Prisma, and Cloudinary.

![LifeLink Screenshot](https://via.placeholder.com/800x400?text=Add+Screenshot+Here)

## ✨ Features

### Core Functionality

- 🔍 **Smart Search** - Blood type compatibility matching (AB+ finds all types, O- finds only O-)
- 📍 **Location-Based** - Search donors by city/region with fuzzy matching
- 📞 **One-Tap Calling** - Direct phone links for mobile users
- 🔄 **Refresh Results** - Seeded shuffle shows different donors each time
- 📸 **Photo Uploads** - Cloudinary CDN with signed uploads
- 🌍 **International** - Phone input with country codes (194 countries)

### Technical Highlights

- ⚡ **Premium UI** - Glass-morphism dark theme with smooth animations
- ♿ **Accessible** - WCAG AA compliant, keyboard navigation, screen reader friendly
- 🚀 **Fast** - Server-side rendering, optimized images, edge functions
- 🔒 **Secure** - Rate limiting, input sanitization, CSRF protection
- 📱 **Mobile-First** - Responsive design, 44px+ tap targets
- 🎯 **Type-Safe** - Full TypeScript, Zod validation, Prisma types

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Phone Input:** react-phone-number-input

### Backend

- **Runtime:** Node.js 22
- **Database:** PostgreSQL (via Neon/Supabase/Railway)
- **ORM:** Prisma 6
- **CDN:** Cloudinary
- **Rate Limiting:** Upstash Redis
- **Validation:** Zod + libphonenumber-js

### Deployment

- **Hosting:** Vercel (recommended)
- **Edge Functions:** Vercel Edge Runtime
- **CI/CD:** GitHub Actions (auto-deploy)

---

## 📋 Prerequisites

- **Node.js** 18+ (22 recommended)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (cloud or local)
- **Cloudinary** account (free tier works)
- **Upstash** Redis (free tier works)

---

## 🚀 Quick Start

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/lifelink-blood-donors.git
cd lifelink-blood-donors
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Create \`.env\` file in project root:

\`\`\`env

# Database (Required)

DATABASE_URL="postgresql://user:pass@host:5432/lifelink?sslmode=require"

# Cloudinary (Required)

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Upstash Redis (Required for rate limiting)

UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"
\`\`\`

### 4. Set Up Database

\`\`\`bash

# Run migrations

npx prisma migrate dev

# Seed with sample data (optional)

npm run db:seed
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Environment Variables Guide

### Database Configuration

\`\`\`env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"
\`\`\`

**Where to get:**

- **Neon:** https://neon.tech → Create Project → Copy connection string
- **Supabase:** https://supabase.com → Settings → Database → Connection String (URI)
- **Railway:** https://railway.app → New Project → PostgreSQL → Variables

### Cloudinary Configuration

\`\`\`env
CLOUDINARY_CLOUD_NAME="dpk6afdmt" # Your cloud name
CLOUDINARY_API_KEY="123456789012345" # API key (public)
CLOUDINARY_API_SECRET="abcXYZ123..." # API secret (private)
\`\`\`

**Where to get:**

1. Go to https://cloudinary.com
2. Sign up / Log in
3. Dashboard → Account Details
4. Copy Cloud name, API Key, API Secret

**Security Note:** Never commit API Secret to git!

### Upstash Redis Configuration

\`\`\`env
UPSTASH_REDIS_REST_URL="https://valued-shad-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXlkASQg..."
\`\`\`

**Where to get:**

1. Go to https://upstash.com
2. Create database (Regional, enable TLS)
3. REST API tab → Copy URL and Token

---

## 🗄️ Database Schema

### Donor Model

\`\`\`prisma
model Donor {
id String @id @default(uuid())
name String
bloodGroup BloodGroup
locationNormalized String // Lowercase for searching
locationDisplay String // Original for display
phoneDigits String // Digits only
phoneDisplay String // Formatted
photoUrl String? // Cloudinary CDN
photoPublicId String? // For deletion
isAvailable Boolean @default(true)
lastDonationDate DateTime?
consentGiven Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([phoneDigits, bloodGroup, locationNormalized])
@@index([bloodGroup, locationNormalized, isAvailable])
}
\`\`\`

### Blood Group Enum

8 types: A+, A-, B+, B-, AB+, AB-, O+, O-

---

## 📝 Available Scripts

\`\`\`bash

# Development

npm run dev # Start dev server (http://localhost:3000)

# Database

npm run db:migrate # Create and apply migration
npm run db:generate # Regenerate Prisma Client
npm run db:studio # Open Prisma Studio (GUI)
npm run db:seed # Seed database with sample data
npm run db:reset # Reset database (drops all data)

# Production

npm run build # Build for production
npm run start # Start production server
npm run lint # Run ESLint
\`\`\`

---

## 🚀 Deployment to Vercel

### Prerequisites

- GitHub repository
- Vercel account (free)

### Steps

1. **Push to GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Import to Vercel:**

   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repo
   - Configure project

3. **Add Environment Variables:**

   - Settings → Environment Variables
   - Add all variables from `.env`
   - Include DATABASE*URL, CLOUDINARY*_, UPSTASH\__

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Visit your live URL! 🎉

### Auto-Deploy

Every push to `main` branch automatically deploys to production.

---

## 🔧 Configuration Files

### next.config.ts

\`\`\`typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
remotePatterns: [
{
protocol: 'https',
hostname: 'res.cloudinary.com',
pathname: '/**',
},
],
},
};

export default nextConfig;
\`\`\`

### tailwind.config.ts

Uses Tailwind v4 CSS-based configuration in `globals.css`.

---

## 🩺 Blood Compatibility Rules

The search automatically includes compatible donors:

| Recipient | Can Receive From |
| --------- | ---------------- |
| **A+**    | A+, A-, O+, O-   |
| **A-**    | A-, O-           |
| **B+**    | B+, B-, O+, O-   |
| **B-**    | B-, O-           |
| **AB+**   | ALL (Universal)  |
| **AB-**   | A-, B-, AB-, O-  |
| **O+**    | O+, O-           |
| **O-**    | O- only          |

**Universal Donor:** O- (can donate to all)  
**Universal Recipient:** AB+ (can receive from all)

---

## 🛡️ Security Features

- ✅ **Rate Limiting** - 30 search/min, 3 registrations/30min
- ✅ **Input Sanitization** - XSS prevention on all inputs
- ✅ **CSRF Protection** - Built into Next.js Server Actions
- ✅ **Signed Uploads** - Cloudinary signatures prevent abuse
- ✅ **Phone Validation** - International format verification
- ✅ **Duplicate Prevention** - Unique constraints on phone+blood+location

---

## ♿ Accessibility

- ✅ **WCAG AA Compliant** - Meets accessibility standards
- ✅ **Keyboard Navigation** - Full keyboard support (Tab, Enter, Escape)
- ✅ **Screen Readers** - ARIA labels, live regions, semantic HTML
- ✅ **Focus Indicators** - Visible focus rings for keyboard users
- ✅ **Mobile-Friendly** - 44px+ tap targets, responsive design

---

## 🐛 Troubleshooting

### Issue: Database connection fails

**Error:** `Can't reach database server`

**Fix:**

1. Check DATABASE_URL is correct
2. Verify database is running
3. Check firewall/network settings
4. For cloud databases, check IP whitelist

### Issue: Images not loading

**Error:** `hostname "res.cloudinary.com" is not configured`

**Fix:**

1. Add Cloudinary domain to `next.config.ts`
2. Restart dev server
3. Clear browser cache

### Issue: Rate limiting not working

**Solution:**

- In-memory rate limiting resets on server restart (expected)
- Upstash Redis persists across restarts
- Check Upstash dashboard for keys

### Issue: Phone validation fails

**Fix:**

- Ensure phone starts with `+` and country code
- Example: `+91 98765 43210` (India)
- Must have at least 10 digits total

### Issue: Prisma Client errors

**Fix:**
\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

---

## 📈 Performance Optimizations

- ⚡ **Next.js Image** - Automatic optimization, WebP conversion
- ⚡ **Server Components** - Reduced client-side JavaScript
- ⚡ **Database Indexes** - Fast queries on blood type and location
- ⚡ **Redis Caching** - Rate limit checks in <1ms
- ⚡ **Edge Functions** - Low latency globally
- ⚡ **CDN Images** - Cloudinary serves from nearest edge

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Cloudinary** - Image CDN and optimization
- **Upstash** - Serverless Redis
- **Neon** - Serverless PostgreSQL
- **Vercel** - Hosting and deployment

---

## 📞 Support

For issues and questions:

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/lifelink-blood-donors/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/lifelink-blood-donors/discussions)

---

## 🗺️ Roadmap

- [ ] SMS notifications for donor matches
- [ ] Admin dashboard for moderation
- [ ] Donation history tracking
- [ ] Blood bank partnerships
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Email notifications

---

**Built with ❤️ to save lives**
\`\`\`

---

## Step 2: Add Screenshots

**What:** Visual preview of your app  
**Why:** Screenshots help users understand what they're getting.

Take screenshots of:

1. Search page
2. Donor cards
3. Registration form
4. Mobile view

Upload to your repo or use a service like [imgur.com](https://imgur.com) or [cloudinary.com](https://cloudinary.com), then update the screenshot URL in README.

---

## Step 3: Create License File

**What:** Define how others can use your code  
**Why:** Legal protection and clarity for contributors.

Create `LICENSE`:

\`\`\`
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

---

## Step 4: Add Contributing Guidelines

**What:** Instructions for contributors  
**Why:** Makes it easier for others to contribute.

Create `CONTRIBUTING.md`:

\`\`\`markdown

# Contributing to LifeLink

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: \`git clone https://github.com/YOUR_USERNAME/lifelink-blood-donors.git\`
3. Install dependencies: \`npm install\`
4. Create a branch: \`git checkout -b feature/your-feature-name\`

## Development Workflow

1. Make your changes
2. Test locally: \`npm run dev\`
3. Run linter: \`npm run lint\`
4. Commit with clear message: \`git commit -m "Add: feature description"\`
5. Push to your fork: \`git push origin feature/your-feature-name\`
6. Open a Pull Request

## Commit Message Format

- **Add:** New feature
- **Fix:** Bug fix
- **Update:** Changes to existing features
- **Refactor:** Code restructuring
- **Docs:** Documentation changes
- **Style:** UI/CSS changes

## Code Style

- Use TypeScript for all new files
- Follow existing code structure
- Add comments for complex logic
- Use Prettier for formatting

## Testing

- Test all user flows before submitting PR
- Check mobile responsiveness
- Verify accessibility (keyboard navigation)

## Questions?

Open an issue or discussion on GitHub!
\`\`\`

---

**That's it! Your app is live! 🚀**
\`\`\`
