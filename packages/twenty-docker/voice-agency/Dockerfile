FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm install


# Copy source code
COPY . .

# Expose the API port (as defined in voice repo config/config.js or .env)
EXPOSE 5000

CMD ["npm", "start"]
