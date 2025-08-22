FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Install dependencies globally to make next available in PATH
RUN npm install -g next

# Install project dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT 3000
ENV HOSTNAME 0.0.0.0
ENV NODE_ENV development

# Start the development server
CMD ["npm", "run", "dev"]