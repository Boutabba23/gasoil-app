# Gasoil App Docker Deployment

This document provides instructions on how to deploy the Gasoil App using Docker on a VPS.

## Prerequisites

- Docker installed on your VPS
- Docker Compose installed on your VPS
- Git installed on your VPS (optional, for cloning the repository)

## Deployment Steps

1. Clone your repository to the VPS:
   ```bash
   git clone <your-repository-url>
   cd gasoil-app
   ```

2. Create environment variables for the server:
   Create a `.env` file in the server directory with the necessary environment variables:
   ```bash
   cd server
   cp .env.example .env
   ```

   Edit the `.env` file with your actual values. The file should contain:
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=http://localhost
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://<your-vps-ip>:5000/api/auth/google/callback
   ADMIN_GOOGLE_ID=your-admin-google-id
   JWT_EXPIRES_IN=86400
   ```

   Replace the placeholder values with your actual credentials. Make sure to update the GOOGLE_CALLBACK_URL with your VPS IP address.

3. Build and start the containers:
   ```bash
   cd ..  # Go back to the root directory
   docker-compose up -d --build
   ```

4. Check the status of the containers:
   ```bash
   docker-compose ps
   ```

5. View logs if needed:
   ```bash
   docker-compose logs -f
   ```

## Updating the Application

To update your application after making changes:

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose up -d --build
   ```

## Database Configuration

This application is configured to use MongoDB Atlas as the database. Make sure to:

1. Update the `MONGODB_URI` environment variable in the server's `.env` file with your MongoDB Atlas connection string.
2. Whitelist your VPS IP address in MongoDB Atlas Network Access settings.
3. Ensure your database user has the necessary permissions for the database operations.

Example MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

## Security Considerations

1. Use strong passwords and secrets in your environment variables.
2. Consider using a reverse proxy like Nginx or Traefik for SSL termination.
3. Regularly update your Docker images to get security patches.
4. Limit access to your VPS firewall to only necessary ports.

## Troubleshooting

- If the client can't connect to the server, check the nginx configuration in `client/nginx.conf`.
- If the server can't connect to the database, ensure the database service is running and the connection string is correct.
- Check logs with `docker-compose logs -f [service-name]` to diagnose issues.
