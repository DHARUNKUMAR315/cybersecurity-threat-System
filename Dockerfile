FROM node:18

WORKDIR /app

# Copy all files (including pre-built frontend/dist)
COPY . .

# Install only the necessary production backend dependencies
RUN npm install --omit=dev
RUN npm install http-proxy-middleware express

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=7860
ENV MAIN_SERVER_PORT=3000
ENV TRAP_SERVER_PORT=3001

EXPOSE 7860

CMD ["node", "hf-server.js"]
