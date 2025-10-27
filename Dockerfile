# Full-Stack Dockerfile - Backend + Frontend
FROM python:3.11 AS backend-build

# Set working directory
WORKDIR /app

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy backend files
COPY *.py ./
COPY routers ./routers/

# Create data directory
RUN mkdir -p /app/data

# Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --production

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
# Set API URL to relative path so it uses same domain
ENV REACT_APP_API_URL=/api
RUN npm run build

# Final stage: Python runtime with both backend and frontend
FROM python:3.11-slim

WORKDIR /app

# Install curl and nginx for serving frontend
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl nginx && \
    rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from backend-build
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# Copy backend application
COPY --from=backend-build /app /app

# Copy frontend build to nginx html directory
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-fullstack.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/sites-enabled/default

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl --fail http://localhost:8080/api/health || exit 1

# Copy startup script
COPY start-fullstack.sh /start-fullstack.sh
RUN chmod +x /start-fullstack.sh

# Start both nginx and uvicorn
CMD ["/start-fullstack.sh"]