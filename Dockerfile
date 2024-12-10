# Use the official Nginx image
FROM nginx:latest

# Copy all files from the "main" directory into Nginx's default directory
COPY main/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
