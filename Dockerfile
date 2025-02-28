FROM node:latest

# Install pnpm globally using npm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

RUN pnpm build

# Expose the application port
EXPOSE 4173
# Start the application
CMD ["pnpm", "preview", "--host", "0.0.0.0"]
