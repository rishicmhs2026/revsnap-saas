#!/bin/bash

# Health Check Script for RevSnap SaaS
# This script monitors the health of the application and sends alerts

set -e

# Configuration
HEALTH_URL="${HEALTH_URL:-https://your-domain.com/api/health}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_NOTIFICATION="${EMAIL_NOTIFICATION:-}"
CHECK_INTERVAL="${CHECK_INTERVAL:-300}"  # 5 minutes
TIMEOUT="${TIMEOUT:-30}"  # 30 seconds
LOG_FILE="/backups/logs/health-check.log"

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

# Create logs directory if it doesn't exist
if [ ! -d "/backups/logs" ]; then
    mkdir -p "/backups/logs"
fi

# Function to check application health
check_health() {
    local url="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    print_status "Checking health at $timestamp"
    print_status "URL: $url"
    
    # Perform health check with timeout
    local response_code
    local response_time
    local error_message=""
    
    # Use curl with timeout and capture response
    local curl_output
    curl_output=$(curl -s -w "%{http_code}|%{time_total}" --max-time "$TIMEOUT" "$url" 2>&1) || {
        error_message="Connection failed or timeout"
        response_code="000"
        response_time="0"
    }
    
    if [ -z "$error_message" ]; then
        # Parse curl output
        response_code=$(echo "$curl_output" | tail -n1 | cut -d'|' -f1)
        response_time=$(echo "$curl_output" | tail -n1 | cut -d'|' -f2)
    fi
    
    # Log the check
    echo "$timestamp|$url|$response_code|$response_time|$error_message" >> "$LOG_FILE"
    
    # Evaluate health status
    if [ "$response_code" = "200" ]; then
        print_success "Health check passed - Status: $response_code, Time: ${response_time}s"
        return 0
    else
        print_error "Health check failed - Status: $response_code, Time: ${response_time}s"
        if [ -n "$error_message" ]; then
            print_error "Error: $error_message"
        fi
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    print_status "Checking database connectivity..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set, skipping database check"
        return 0
    fi
    
    # Try to connect to database
    if command -v psql &> /dev/null; then
        if timeout 10 psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Database connectivity check passed"
            return 0
        else
            print_error "Database connectivity check failed"
            return 1
        fi
    else
        print_warning "psql not available, skipping database check"
        return 0
    fi
}

# Function to check Redis connectivity
check_redis() {
    print_status "Checking Redis connectivity..."
    
    if [ -z "$REDIS_URL" ]; then
        print_warning "REDIS_URL not set, skipping Redis check"
        return 0
    fi
    
    # Try to connect to Redis
    if command -v redis-cli &> /dev/null; then
        if timeout 10 redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
            print_success "Redis connectivity check passed"
            return 0
        else
            print_error "Redis connectivity check failed"
            return 1
        fi
    else
        print_warning "redis-cli not available, skipping Redis check"
        return 0
    fi
}

# Function to send Slack notification
send_slack_notification() {
    local status="$1"
    local message="$2"
    local details="$3"
    
    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        return
    fi
    
    local color="good"
    if [ "$status" = "error" ]; then
        color="danger"
    elif [ "$status" = "warning" ]; then
        color="warning"
    fi
    
    local payload="{\"attachments\":[{\"color\":\"$color\",\"title\":\"RevSnap SaaS Health Check\",\"text\":\"$message\",\"fields\":[{\"title\":\"Status\",\"value\":\"$status\",\"short\":true},{\"title\":\"Time\",\"value\":\"$(date)\",\"short\":true},{\"title\":\"Details\",\"value\":\"$details\",\"short\":false}]}]}"
    
    curl -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK_URL" >> "$LOG_FILE" 2>&1 || true
}

# Function to send email notification
send_email_notification() {
    local status="$1"
    local message="$2"
    
    if [ -z "$EMAIL_NOTIFICATION" ] || ! command -v mail &> /dev/null; then
        return
    fi
    
    local subject="RevSnap SaaS Health Check - $status"
    local body="Health Check Status: $status\nMessage: $message\nTime: $(date)\nURL: $HEALTH_URL"
    
    echo -e "$body" | mail -s "$subject" "$EMAIL_NOTIFICATION" || true
}

# Function to check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local threshold=90  # 90% threshold
    local usage
    
    # Get disk usage percentage
    usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        print_warning "Disk usage is high: ${usage}%"
        send_slack_notification "warning" "High disk usage detected" "Disk usage: ${usage}%"
        return 1
    else
        print_success "Disk usage is normal: ${usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    local threshold=90  # 90% threshold
    local usage
    
    # Get memory usage percentage
    usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$usage" -gt "$threshold" ]; then
        print_warning "Memory usage is high: ${usage}%"
        send_slack_notification "warning" "High memory usage detected" "Memory usage: ${usage}%"
        return 1
    else
        print_success "Memory usage is normal: ${usage}%"
        return 0
    fi
}

# Function to perform comprehensive health check
perform_health_check() {
    local overall_status=0
    local failed_checks=()
    
    print_status "Starting comprehensive health check..."
    
    # Check application health
    if ! check_health "$HEALTH_URL"; then
        overall_status=1
        failed_checks+=("Application")
    fi
    
    # Check database connectivity
    if ! check_database; then
        overall_status=1
        failed_checks+=("Database")
    fi
    
    # Check Redis connectivity
    if ! check_redis; then
        overall_status=1
        failed_checks+=("Redis")
    fi
    
    # Check disk space
    if ! check_disk_space; then
        overall_status=1
        failed_checks+=("Disk Space")
    fi
    
    # Check memory usage
    if ! check_memory; then
        overall_status=1
        failed_checks+=("Memory")
    fi
    
    # Send notifications based on overall status
    if [ $overall_status -eq 0 ]; then
        print_success "All health checks passed"
        send_slack_notification "success" "All health checks passed" "Application is healthy"
        send_email_notification "success" "All health checks passed"
    else
        local failed_list=$(IFS=", "; echo "${failed_checks[*]}")
        print_error "Health check failed for: $failed_list"
        send_slack_notification "error" "Health check failed" "Failed checks: $failed_list"
        send_email_notification "error" "Health check failed for: $failed_list"
    fi
    
    return $overall_status
}

# Function to run continuous monitoring
run_continuous_monitoring() {
    print_status "Starting continuous monitoring..."
    print_status "Check interval: ${CHECK_INTERVAL} seconds"
    
    while true; do
        perform_health_check
        
        # Wait for next check
        sleep "$CHECK_INTERVAL"
    done
}

# Main execution
main() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    print_status "Health check started at $timestamp"
    
    # Check if running in continuous mode
    if [ "$1" = "--continuous" ]; then
        run_continuous_monitoring
    else
        # Single health check
        perform_health_check
        exit $?
    fi
}

# Run main function
main "$@" 