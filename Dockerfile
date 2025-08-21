FROM node:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

RUN npm run build

# Expose the application port
EXPOSE 4173
# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
