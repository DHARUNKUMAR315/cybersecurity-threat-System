FROM node:18

WORKDIR /app

# Force development mode during build to ensure Vite and Vue plugins are installed
ENV NODE_ENV=development

# Install root dependencies
COPY package*.json ./
RUN npm install
RUN npm install http-proxy-middleware express

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy Backend and server scripts
COPY Backend/ ./Backend/
COPY hf-server.js ./

# Set environment variables for Hugging Face
ENV NODE_ENV=production
ENV PORT=7860
ENV MAIN_SERVER_PORT=3000
ENV TRAP_SERVER_PORT=3001

EXPOSE 7860

CMD ["node", "hf-server.js"]
