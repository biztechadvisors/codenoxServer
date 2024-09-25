# Stage 1: Build the application
FROM node:18 as builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies to optimize the image
RUN npm prune --production

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy environment variables (ensure .env is provided during container runtime or copied)
COPY .env ./

# Expose the application port
EXPOSE 5003

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
