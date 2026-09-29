FROM node:18

WORKDIR /app

# Copy package manifests for layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install backend and frontend dependencies
RUN npm install
RUN cd frontend && npm install

# Copy application source code
COPY . .

# Build frontend production bundle
RUN cd frontend && npm run build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=7860
ENV MAIN_SERVER_PORT=3000
ENV TRAP_SERVER_PORT=3001

EXPOSE 7860

CMD ["node", "hf-server.js"]
