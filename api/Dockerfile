# Use an official Node.js runtime as the base image
FROM node:18.14.2

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Expose a port (if your Node.js server listens on a specific port)
EXPOSE 8080

# Specify the command to run your server
CMD ["npm", "run", "production"]
