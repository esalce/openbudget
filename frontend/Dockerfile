FROM node:18-alpine

WORKDIR /app

# Install pnpm and dependencies
COPY . .
RUN npm install -g pnpm && pnpm install

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
