# Official Playwright image with pre-installed Chromium and Linux dependencies
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies (including better-sqlite3 native build tools)
RUN npm ci

# Copy application source
COPY . .

# Set environment defaults
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_HEADLESS=true
ENV NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Build Next.js application
RUN npm run build

# Expose server port
EXPOSE 3000

# Launch production server
CMD ["npm", "run", "start"]
