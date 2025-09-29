#!/bin/bash

# Database Backup Script for RevSnap SaaS
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
LOG_FILE="/backups/logs/backup_$DATE.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Create logs directory if it doesn't exist
if [ ! -d "/backups/logs" ]; then
    print_status "Creating logs directory: /backups/logs"
    mkdir -p "/backups/logs"
fi

# Function to create backup
create_backup() {
    local backup_file="$BACKUP_DIR/backup_$DATE.sql"
    local compressed_file="$backup_file.gz"
    
    print_status "Starting database backup..."
    print_status "Backup file: $backup_file"
    
    # Create backup using pg_dump
    if pg_dump "$DATABASE_URL" > "$backup_file" 2>> "$LOG_FILE"; then
        print_success "Database backup created successfully"
        
        # Compress backup
        print_status "Compressing backup..."
        if gzip "$backup_file"; then
            print_success "Backup compressed successfully"
            
            # Get file size
            local file_size=$(du -h "$compressed_file" | cut -f1)
            print_status "Backup size: $file_size"
            
            # Upload to cloud storage if configured
            if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ] && [ -n "$BACKUP_BUCKET" ]; then
                upload_to_s3 "$compressed_file"
            fi
            
            return 0
        else
            print_error "Failed to compress backup"
            return 1
        fi
    else
        print_error "Failed to create database backup"
        return 1
    fi
}

# Function to upload backup to S3
upload_to_s3() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    print_status "Uploading backup to S3..."
    
    if command -v aws &> /dev/null; then
        if aws s3 cp "$file_path" "s3://$BACKUP_BUCKET/database-backups/$file_name" >> "$LOG_FILE" 2>&1; then
            print_success "Backup uploaded to S3 successfully"
        else
            print_warning "Failed to upload backup to S3"
        fi
    else
        print_warning "AWS CLI not installed, skipping S3 upload"
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        if rm "$file"; then
            deleted_count=$((deleted_count + 1))
            print_status "Deleted old backup: $(basename "$file")"
        fi
    done < <(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -print0)
    
    if [ $deleted_count -eq 0 ]; then
        print_status "No old backups to delete"
    else
        print_success "Deleted $deleted_count old backup(s)"
    fi
}

# Function to verify backup
verify_backup() {
    local backup_file="$BACKUP_DIR/backup_$DATE.sql.gz"
    
    print_status "Verifying backup integrity..."
    
    # Check if backup file exists
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Check if backup file is not empty
    local file_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null)
    if [ "$file_size" -eq 0 ]; then
        print_error "Backup file is empty"
        return 1
    fi
    
    # Test if backup can be decompressed
    if gunzip -t "$backup_file" 2>/dev/null; then
        print_success "Backup integrity verified"
        return 0
    else
        print_error "Backup file is corrupted"
        return 1
    fi
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Send Slack notification if webhook is configured
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        if [ "$status" = "error" ]; then
            color="danger"
        elif [ "$status" = "warning" ]; then
            color="warning"
        fi
        
        local payload="{\"attachments\":[{\"color\":\"$color\",\"title\":\"Database Backup\",\"text\":\"$message\",\"fields\":[{\"title\":\"Date\",\"value\":\"$(date)\",\"short\":true},{\"title\":\"Status\",\"value\":\"$status\",\"short\":true}]}]}"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL" >> "$LOG_FILE" 2>&1 || true
    fi
    
    # Send email notification if configured
    if [ -n "$BACKUP_NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "Database Backup - $status" "$BACKUP_NOTIFICATION_EMAIL" || true
    fi
}

# Main execution
main() {
    print_status "Starting database backup process..."
    print_status "Date: $(date)"
    print_status "Backup directory: $BACKUP_DIR"
    print_status "Retention days: $RETENTION_DAYS"
    
    # Create backup
    if create_backup; then
        # Verify backup
        if verify_backup; then
            print_success "Database backup completed successfully"
            send_notification "success" "Database backup completed successfully. File: backup_$DATE.sql.gz"
        else
            print_error "Backup verification failed"
            send_notification "error" "Database backup verification failed"
            exit 1
        fi
    else
        print_error "Database backup failed"
        send_notification "error" "Database backup failed"
        exit 1
    fi
    
    # Clean up old backups
    cleanup_old_backups
    
    print_success "Database backup process completed"
}

# Run main function
main "$@" 