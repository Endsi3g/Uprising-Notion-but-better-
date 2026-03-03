FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
# If there's a yarn.lock or pnpm-lock.yaml in the future, copy it too
# COPY yarn.lock ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["npm", "start"]
