FROM node:18

WORKDIR /app

# Copy all files first (respecting .dockerignore)
COPY . .

# Install root dependencies
RUN npm install
RUN npm install http-proxy-middleware express

# Install frontend dependencies and build
RUN cd frontend && npm install
RUN cd frontend && npm run build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=7860
ENV MAIN_SERVER_PORT=3000
ENV TRAP_SERVER_PORT=3001

EXPOSE 7860

CMD ["node", "hf-server.js"]
