FROM python:latest
ADD . / ./
CMD ["python", "-u", "./app.py"]