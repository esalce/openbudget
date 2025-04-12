#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  echo -e "${BLUE}[OpenBudget]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[OpenBudget]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[OpenBudget]${NC} $1"
}

print_error() {
  echo -e "${RED}[OpenBudget]${NC} $1"
}

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Function to display help message
show_help() {
  echo "OpenBudget Development Script"
  echo ""
  echo "Usage: ./dev.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start           Start the development environment"
  echo "  stop            Stop the development environment"
  echo "  logs            View logs from all containers"
  echo "  frontend-logs   View frontend logs"
  echo "  backend-logs    View backend logs"
  echo "  frontend-shell  Access shell in the frontend container"
  echo "  backend-shell   Access shell in the backend container"
  echo "  rebuild         Rebuild containers"
  echo "  clean           Remove all containers and volumes"
  echo "  help            Show this help message"
  echo ""
  exit 0
}

# Function to start the development environment
start() {
  print_message "Starting OpenBudget development environment..."
  docker-compose up -d
  
  # Wait for services to be ready
  print_message "Waiting for services to be ready..."
  sleep 3
  
  print_success "Services started!"
  echo ""
  echo "Frontend: http://localhost:5173"
  echo "Backend API: http://localhost:8000"
  echo "API docs: http://localhost:8000/docs"
}

# Function to stop the development environment
stop() {
  print_message "Stopping OpenBudget development environment..."
  docker-compose down
  print_success "Services stopped!"
}

# Function to view logs
logs() {
  docker-compose logs -f
}

# Function to view frontend logs
frontend_logs() {
  docker-compose logs -f frontend
}

# Function to view backend logs
backend_logs() {
  docker-compose logs -f backend
}

# Function to rebuild containers
rebuild() {
  print_message "Rebuilding containers..."
  docker-compose build
  docker-compose up -d
  print_success "Rebuild complete!"
}

# Function to access shell in the frontend container
frontend_shell() {
  print_message "Accessing frontend shell..."
  docker-compose exec frontend /bin/sh
}

# Function to access shell in the backend container
backend_shell() {
  print_message "Accessing backend shell..."
  docker-compose exec backend /bin/bash
}

# Function to clean up
clean() {
  print_warning "Warning: This will remove all Docker containers and volumes!"
  read -p "Are you sure you want to continue? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    print_success "Clean completed!"
  else
    print_message "Clean aborted."
  fi
}

# Check parameters
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  logs)
    logs
    ;;
  frontend-logs)
    frontend_logs
    ;;
  backend-logs)
    backend_logs
    ;;
  frontend-shell)
    frontend_shell
    ;;
  backend-shell)
    backend_shell
    ;;
  rebuild)
    rebuild
    ;;
  clean)
    clean
    ;;
  help|*)
    show_help
    ;;
esac

exit 0