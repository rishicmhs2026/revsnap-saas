#!/bin/bash

# Production Infrastructure Setup Script for RevSnap SaaS
# This script sets up all production infrastructure components

set -e

echo "🚀 Setting up Production Infrastructure for RevSnap SaaS"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    # Check for required commands
    for cmd in curl wget git node npm; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Setup PostgreSQL
setup_postgresql() {
    print_status "Setting up PostgreSQL..."
    
    # Check if PostgreSQL is already installed
    if command -v psql &> /dev/null; then
        print_warning "PostgreSQL is already installed"
        return
    fi
    
    # Detect OS and install PostgreSQL
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            print_status "Installing PostgreSQL on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_status "Installing PostgreSQL on CentOS/RHEL..."
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl enable postgresql
            sudo systemctl start postgresql
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_status "Installing PostgreSQL on macOS..."
        if command -v brew &> /dev/null; then
            brew install postgresql
            brew services start postgresql
        else
            print_error "Homebrew is required to install PostgreSQL on macOS"
            exit 1
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "PostgreSQL installed successfully"
}

# Setup Redis
setup_redis() {
    print_status "Setting up Redis..."
    
    # Check if Redis is already installed
    if command -v redis-server &> /dev/null; then
        print_warning "Redis is already installed"
        return
    fi
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            print_status "Installing Redis on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y redis-server
            sudo systemctl enable redis-server
            sudo systemctl start redis-server
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_status "Installing Redis on CentOS/RHEL..."
            sudo yum install -y redis
            sudo systemctl enable redis
            sudo systemctl start redis
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_status "Installing Redis on macOS..."
        if command -v brew &> /dev/null; then
            brew install redis
            brew services start redis
        else
            print_error "Homebrew is required to install Redis on macOS"
            exit 1
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Redis installed successfully"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Check if certbot is already installed
    if command -v certbot &> /dev/null; then
        print_warning "Certbot is already installed"
        return
    fi
    
    # Install certbot
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            print_status "Installing Certbot on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_status "Installing Certbot on CentOS/RHEL..."
            sudo yum install -y certbot python3-certbot-nginx
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_status "Installing Certbot on macOS..."
        if command -v brew &> /dev/null; then
            brew install certbot
        else
            print_error "Homebrew is required to install Certbot on macOS"
            exit 1
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Certbot installed successfully"
}

# Setup backup directories
setup_backups() {
    print_status "Setting up backup directories..."
    
    # Create backup directories
    sudo mkdir -p /backups/postgresql
    sudo mkdir -p /backups/files
    sudo mkdir -p /backups/logs
    
    # Set permissions
    sudo chown -R $USER:$USER /backups
    sudo chmod -R 755 /backups
    
    print_success "Backup directories created"
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    # Install production dependencies
    npm install --production
    
    # Install Redis client
    npm install ioredis
    
    # Install monitoring dependencies
    npm install node-cron axios
    
    print_success "Node.js dependencies installed"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create production environment file if it doesn't exist
    if [ ! -f .env.production ]; then
        cp env.example .env.production
        print_warning "Created .env.production from env.example"
        print_warning "Please update .env.production with your production values"
    else
        print_warning ".env.production already exists"
    fi
    
    print_success "Environment variables configured"
}

# Setup cron jobs
setup_cron_jobs() {
    print_status "Setting up cron jobs..."
    
    # Create cron job for database backups
    local backup_script="$PWD/scripts/backup-database.sh"
    local health_script="$PWD/scripts/health-check.sh"
    
    # Make scripts executable
    chmod +x "$backup_script"
    chmod +x "$health_script"
    
    # Add cron jobs (commented out for safety)
    print_warning "Please manually add the following cron jobs:"
    echo "0 2 * * * $backup_script"
    echo "*/5 * * * * $health_script"
    
    print_success "Cron jobs configured"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring configuration
    cat > monitoring-config.json << EOF
{
  "endpoints": [
    "https://your-domain.com/api/health",
    "https://your-domain.com/api/analytics"
  ],
  "check_interval": 300,
  "timeout": 10000,
  "alerts": {
    "slack_webhook": "your-slack-webhook-url",
    "email": "admin@your-domain.com"
  }
}
EOF
    
    print_success "Monitoring configuration created"
}

# Main execution
main() {
    print_status "Starting production infrastructure setup..."
    
    check_dependencies
    setup_postgresql
    setup_redis
    setup_ssl
    setup_backups
    install_dependencies
    setup_environment
    setup_cron_jobs
    setup_monitoring
    
    print_success "Production infrastructure setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Update .env.production with your production values"
    echo "2. Set up your PostgreSQL database"
    echo "3. Configure Redis connection"
    echo "4. Set up your domain and SSL certificates"
    echo "5. Configure monitoring alerts"
    echo "6. Test all components"
    echo "7. Deploy to production"
    echo ""
    print_warning "Please review and update all configuration files before deploying to production"
}

# Run main function
main "$@" 