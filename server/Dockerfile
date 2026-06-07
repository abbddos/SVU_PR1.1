# Step 1: Use the specific official Python version image
FROM python:3.14-slim

# Step 2: Set environment variables to keep Python snappy inside the container
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Step 3: Install minimal system dependencies required for build/runtime tools if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Create a dedicated, non-root system user and group
RUN groupadd -r bravesgroup && useradd -r -g bravesgroup -m -d /home/braves braves

# Step 5: Set up the application workspace directory inside the user's home
WORKDIR /home/braves/app

# Step 6: Copy dependency file first to leverage Docker's caching layer
COPY requirements.txt .

# Step 7: Install Python dependencies (including gunicorn)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Step 8: Copy the rest of the backend source code into the app directory
COPY . .

# Step 9: Transfer ownership of the entire workspace to the dedicated user
# This guarantees write permissions for creating/modifying the sqlite.db file
RUN chown -R braves:bravesgroup /home/braves

# Step 10: Switch execution context away from root to the non-root user
USER braves

# Step 11: Inform Docker that the container listens on port 5000 at runtime
EXPOSE 5000

# Step 12: Production command using Gunicorn instead of the Flask built-in server
# Assuming your main Flask instance or factory is named 'app' inside 'app.py'
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "4"]