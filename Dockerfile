FROM node:18-slim

# Install build tools for native node modules (like sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies for backend and frontend
RUN npm install
RUN cd frontend && npm install && npm run build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=7860
ENV MAIN_SERVER_PORT=3000
ENV TRAP_SERVER_PORT=3001

EXPOSE 7860

CMD ["node", "hf-server.js"]
