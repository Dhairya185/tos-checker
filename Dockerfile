# Use a standard Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Create user to run the app (Hugging Face Spaces requires UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Copy requirements and install
COPY --chown=user requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files (including fine_tuned_model)
COPY --chown=user . /app/

# Expose port 7860
EXPOSE 7860

# Run the FastAPI server on port 7860
CMD ["uvicorn", "tos_checker:app", "--host", "0.0.0.0", "--port", "7860"]
