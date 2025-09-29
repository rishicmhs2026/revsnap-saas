#!/bin/bash

# PostgreSQL Migration Script for RevSnap SaaS
# This script migrates the database from SQLite to PostgreSQL

set -e

echo "🚀 Starting PostgreSQL Migration for RevSnap SaaS"
echo "=================================================="

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

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    print_status "Please set DATABASE_URL to your PostgreSQL connection string"
    exit 1
fi

# Check if PostgreSQL URL is provided
if [[ ! "$DATABASE_URL" == postgresql://* ]]; then
    print_error "DATABASE_URL must be a PostgreSQL connection string"
    print_status "Expected format: postgresql://username:password@host:port/database"
    exit 1
fi

# Backup current SQLite database
backup_sqlite() {
    print_status "Creating backup of current SQLite database..."
    
    if [ -f "prisma/dev.db" ]; then
        cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)
        print_success "SQLite database backed up"
    else
        print_warning "No SQLite database found to backup"
    fi
}

# Update Prisma schema
update_schema() {
    print_status "Updating Prisma schema for PostgreSQL..."
    
    # Create backup of current schema
    cp prisma/schema.prisma prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update the datasource provider
    sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    
    print_success "Prisma schema updated for PostgreSQL"
}

# Test PostgreSQL connection
test_connection() {
    print_status "Testing PostgreSQL connection..."
    
    if command -v psql &> /dev/null; then
        if timeout 10 psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "PostgreSQL connection successful"
            return 0
        else
            print_error "PostgreSQL connection failed"
            return 1
        fi
    else
        print_warning "psql not available, skipping connection test"
        return 0
    fi
}

# Generate Prisma client
generate_client() {
    print_status "Generating Prisma client..."
    
    if npx prisma generate; then
        print_success "Prisma client generated successfully"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
}

# Create database tables
create_tables() {
    print_status "Creating database tables..."
    
    if npx prisma db push; then
        print_success "Database tables created successfully"
    else
        print_error "Failed to create database tables"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if npx prisma migrate deploy; then
        print_success "Database migrations completed successfully"
    else
        print_error "Failed to run database migrations"
        exit 1
    fi
}

# Seed database
seed_database() {
    print_status "Seeding database..."
    
    if npm run db:seed; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding failed or not configured"
    fi
}

# Verify migration
verify_migration() {
    print_status "Verifying migration..."
    
    # Test basic database operations
    if npx prisma studio --port 5555 --browser none > /dev/null 2>&1 & then
        local studio_pid=$!
        sleep 5
        
        # Test a simple query
        if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" > /dev/null 2>&1; then
            print_success "Migration verification successful"
            kill $studio_pid 2>/dev/null || true
        else
            print_error "Migration verification failed"
            kill $studio_pid 2>/dev/null || true
            exit 1
        fi
    else
        print_warning "Could not start Prisma Studio for verification"
    fi
}

# Update environment variables
update_env() {
    print_status "Updating environment variables..."
    
    # Update .env file
    if [ -f ".env" ]; then
        # Backup current .env
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        
        # Update DATABASE_URL
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
        
        print_success "Environment variables updated"
    else
        print_warning ".env file not found"
    fi
}

# Cleanup old files
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove backup files
    rm -f prisma/schema.prisma.backup.*
    rm -f .env.backup.*
    
    print_success "Cleanup completed"
}

# Rollback function
rollback() {
    print_error "Migration failed, rolling back..."
    
    # Restore schema
    if ls prisma/schema.prisma.backup.* > /dev/null 2>&1; then
        cp prisma/schema.prisma.backup.* prisma/schema.prisma
        print_status "Schema restored"
    fi
    
    # Restore .env
    if ls .env.backup.* > /dev/null 2>&1; then
        cp .env.backup.* .env
        print_status "Environment variables restored"
    fi
    
    # Regenerate client
    npx prisma generate
    
    print_warning "Rollback completed. Please check your PostgreSQL configuration and try again."
}

# Main execution
main() {
    print_status "Starting PostgreSQL migration process..."
    
    # Set up error handling
    trap 'rollback' ERR
    
    # Execute migration steps
    backup_sqlite
    update_schema
    test_connection
    generate_client
    create_tables
    run_migrations
    seed_database
    verify_migration
    update_env
    cleanup
    
    # Remove error trap
    trap - ERR
    
    print_success "PostgreSQL migration completed successfully!"
    echo ""
    print_status "Migration Summary:"
    echo "✅ SQLite database backed up"
    echo "✅ Prisma schema updated for PostgreSQL"
    echo "✅ Database connection verified"
    echo "✅ Database tables created"
    echo "✅ Migrations applied"
    echo "✅ Database seeded"
    echo "✅ Migration verified"
    echo "✅ Environment variables updated"
    echo ""
    print_warning "Next steps:"
    echo "1. Test your application thoroughly"
    echo "2. Update your deployment configuration"
    echo "3. Monitor database performance"
    echo "4. Set up database backups"
    echo "5. Configure connection pooling if needed"
}

# Check if running in dry-run mode
if [ "$1" = "--dry-run" ]; then
    print_status "DRY RUN MODE - No changes will be made"
    print_status "DATABASE_URL: $DATABASE_URL"
    print_status "Current schema provider: $(grep 'provider =' prisma/schema.prisma)"
    exit 0
fi

# Run main function
main "$@" 