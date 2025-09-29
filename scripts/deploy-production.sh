#!/bin/bash

# RevSnap SaaS - Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="revsnap-saas"
DEPLOYMENT_PLATFORM=${DEPLOYMENT_PLATFORM:-"vercel"}
NODE_ENV="production"

echo -e "${BLUE}🚀 RevSnap SaaS - Production Deployment${NC}"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Validate environment variables
validate_environment() {
    print_info "Validating environment variables..."
    
    # Required environment variables
    REQUIRED_VARS=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        print_info "Please set these variables in your environment or .env.production file"
        exit 1
    fi
    
    print_status "Environment validation passed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm ci --production=false
    
    print_status "Dependencies installed"
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    print_status "Database migrations completed"
}

# Build the application
build_application() {
    print_info "Building application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    print_status "Application built successfully"
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Run type checking
    npm run type-check
    
    # Run linting
    npm run lint
    
    print_status "Tests passed"
}

# Deploy to Vercel
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod --yes
    
    print_status "Deployment to Vercel completed"
}

# Deploy to custom server
deploy_custom() {
    print_info "Deploying to custom server..."
    
    # Create deployment package
    DEPLOY_DIR="deploy"
    mkdir -p $DEPLOY_DIR
    
    # Copy necessary files
    cp -r .next $DEPLOY_DIR/
    cp -r public $DEPLOY_DIR/
    cp package.json $DEPLOY_DIR/
    cp package-lock.json $DEPLOY_DIR/
    cp next.config.ts $DEPLOY_DIR/
    cp tsconfig.json $DEPLOY_DIR/
    cp -r prisma $DEPLOY_DIR/
    
    # Create production start script
    cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm start
EOF
    
    chmod +x $DEPLOY_DIR/start.sh
    
    print_status "Deployment package created in $DEPLOY_DIR/"
    print_info "Upload the contents of $DEPLOY_DIR/ to your server and run start.sh"
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Wait for deployment to be ready
    sleep 30
    
    # Get the deployment URL
    if [ "$DEPLOYMENT_PLATFORM" = "vercel" ]; then
        DEPLOY_URL=$(vercel ls | grep $APP_NAME | head -1 | awk '{print $2}')
    else
        DEPLOY_URL=${DEPLOY_URL:-"http://localhost:3000"}
    fi
    
    # Check if the application is responding
    if curl -f -s "$DEPLOY_URL/api/health" > /dev/null; then
        print_status "Health check passed - Application is running"
        print_info "Deployment URL: $DEPLOY_URL"
    else
        print_warning "Health check failed - Application may still be starting up"
        print_info "Please check the deployment manually at: $DEPLOY_URL"
    fi
}

# Setup monitoring
setup_monitoring() {
    print_info "Setting up monitoring..."
    
    # Run monitoring setup script if it exists
    if [ -f "scripts/setup-monitoring.sh" ]; then
        chmod +x scripts/setup-monitoring.sh
        ./scripts/setup-monitoring.sh
    fi
    
    print_status "Monitoring setup completed"
}

# Main deployment process
main() {
    echo "Starting production deployment..."
    echo "Platform: $DEPLOYMENT_PLATFORM"
    echo "Environment: $NODE_ENV"
    echo ""
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    install_dependencies
    run_migrations
    build_application
    run_tests
    
    # Deploy based on platform
    case $DEPLOYMENT_PLATFORM in
        "vercel")
            deploy_vercel
            ;;
        "custom")
            deploy_custom
            ;;
        *)
            print_error "Unsupported deployment platform: $DEPLOYMENT_PLATFORM"
            print_info "Supported platforms: vercel, custom"
            exit 1
            ;;
    esac
    
    # Post-deployment tasks
    setup_monitoring
    health_check
    
    echo ""
    print_status "Production deployment completed successfully! 🎉"
    echo ""
    print_info "Next steps:"
    echo "  1. Verify the application is working correctly"
    echo "  2. Set up monitoring alerts"
    echo "  3. Configure backup schedules"
    echo "  4. Test all critical functionality"
    echo "  5. Monitor performance and error rates"
    echo ""
    print_info "For support, contact: support@revsnap.com"
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_prerequisites
        validate_environment
        print_status "Environment check completed"
        ;;
    "build")
        install_dependencies
        run_migrations
        build_application
        run_tests
        print_status "Build completed"
        ;;
    "deploy")
        main
        ;;
    *)
        echo "Usage: $0 {check|build|deploy}"
        echo ""
        echo "Commands:"
        echo "  check   - Check prerequisites and environment"
        echo "  build   - Build the application"
        echo "  deploy  - Full production deployment"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOYMENT_PLATFORM - Deployment platform (vercel|custom)"
        echo "  DEPLOY_URL         - Custom deployment URL"
        echo ""
        exit 1
        ;;
esac 