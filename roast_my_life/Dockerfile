# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory in the container
WORKDIR /app

# Recommended Python runtime flags
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY src/ src/

# Expose port 5000
EXPOSE 5000

# Optional build-time injection of environment variables (not recommended for secrets)
# Usage: docker build --build-arg API_KEY=... --build-arg BASE_URL=... -t roast-my-life .
ARG API_KEY
ARG BASE_URL

# Make them available at runtime (can be overridden by docker run -e / --env-file)
ENV API_KEY=${API_KEY} \
	BASE_URL=${BASE_URL}

# Set environment variables
ENV FLASK_APP=src/app.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "src/app.py"]
