# Use Node.js 18 LTS for better compatibility with React Scripts
FROM node:18-bullseye

# Install common tools and dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Create a non-root user with proper permissions
RUN groupmod --gid 1000 node \
    && usermod --uid 1000 --gid 1000 node \
    && chown -R node:node /workspace

# Switch to non-root user
USER node

# Copy package files first to leverage Docker layer caching
COPY --chown=node:node package*.json ./

# Install dependencies with legacy peer deps flag to handle React Scripts conflicts
# This solves the AJV dependency conflict issue
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy the rest of the application
COPY --chown=node:node . .

# Expose ports for React dev server and Express server
EXPOSE 3000 5000

# Set environment variables for container development
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV GENERATE_SOURCEMAP=false

# Set the default command
CMD ["npm", "run", "dev"]