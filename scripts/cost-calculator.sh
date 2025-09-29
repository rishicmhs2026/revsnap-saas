#!/bin/bash

# Infrastructure Cost Calculator for RevSnap SaaS
# This script helps estimate production infrastructure costs

echo "💰 RevSnap SaaS Infrastructure Cost Calculator"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Function to get user input
get_input() {
    local prompt="$1"
    local default="$2"
    local input
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        echo "${input:-$default}"
    else
        read -p "$prompt: " input
        echo "$input"
    fi
}

# Function to calculate database costs
calculate_database_cost() {
    local users=$1
    local storage=$2
    
    if [ $users -le 1000 ]; then
        echo "0"  # Free tier
    elif [ $users -le 10000 ]; then
        echo "25"  # Supabase Pro
    elif [ $users -le 50000 ]; then
        echo "25"  # Supabase Pro still works
    elif [ $users -le 100000 ]; then
        echo "599"  # Supabase Team
    else
        echo "1000"  # Enterprise
    fi
}

# Function to calculate Redis costs
calculate_redis_cost() {
    local users=$1
    
    if [ $users -le 1000 ]; then
        echo "0"  # Free tier
    elif [ $users -le 10000 ]; then
        echo "25"  # Upstash Pro
    elif [ $users -le 100000 ]; then
        echo "25"  # Upstash Pro still works
    else
        echo "50"  # Enterprise
    fi
}

# Function to calculate CDN costs
calculate_cdn_cost() {
    local users=$1
    local bandwidth=$2
    
    if [ $users -le 1000 ]; then
        echo "0"  # Free tier
    elif [ $users -le 10000 ]; then
        echo "20"  # Vercel Pro
    elif [ $users -le 100000 ]; then
        echo "40"  # Vercel Pro + Cloudflare Pro
    else
        echo "220"  # Vercel Enterprise + Cloudflare Business
    fi
}

# Function to calculate backup costs
calculate_backup_cost() {
    local storage=$1
    
    # $0.023/GB/month for AWS S3
    local cost=$(echo "scale=2; $storage * 0.023" | bc -l 2>/dev/null || echo "5")
    echo "$cost"
}

# Function to calculate monitoring costs
calculate_monitoring_cost() {
    local users=$1
    
    if [ $users -le 1000 ]; then
        echo "0"  # Free tier
    elif [ $users -le 10000 ]; then
        echo "15"  # Basic monitoring
    elif [ $users -le 100000 ]; then
        echo "50"  # Professional monitoring
    else
        echo "200"  # Enterprise monitoring
    fi
}

# Main calculation function
calculate_costs() {
    local users=$1
    local storage=$2
    local bandwidth=$3
    
    print_header "\n📊 Cost Calculation for $users users"
    echo "----------------------------------------"
    
    # Calculate individual costs
    local db_cost=$(calculate_database_cost $users $storage)
    local redis_cost=$(calculate_redis_cost $users)
    local cdn_cost=$(calculate_cdn_cost $users $bandwidth)
    local backup_cost=$(calculate_backup_cost $storage)
    local monitoring_cost=$(calculate_monitoring_cost $users)
    
    # Calculate total
    local total=$(echo "$db_cost + $redis_cost + $cdn_cost + $backup_cost + $monitoring_cost" | bc -l 2>/dev/null || echo "0")
    
    # Display breakdown
    echo "Database (PostgreSQL):     \$$db_cost/month"
    echo "Redis (Caching):           \$$redis_cost/month"
    echo "CDN (Content Delivery):    \$$cdn_cost/month"
    echo "Backup Storage:            \$$backup_cost/month"
    echo "Monitoring & Alerting:     \$$monitoring_cost/month"
    echo "----------------------------------------"
    print_success "Total Infrastructure Cost: \$$total/month"
    
    # Calculate annual cost
    local annual=$(echo "$total * 12" | bc -l 2>/dev/null || echo "0")
    echo "Annual Cost:               \$$annual/year"
    
    # Calculate cost per user
    if [ $users -gt 0 ]; then
        local cost_per_user=$(echo "scale=4; $total / $users" | bc -l 2>/dev/null || echo "0")
        echo "Cost per User:            \$$cost_per_user/month"
    fi
    
    # Recommendations
    print_header "\n🎯 Recommendations:"
    if [ $users -le 1000 ]; then
        print_success "Startup Phase: Use free tiers and scale as you grow"
        echo "Recommended Stack:"
        echo "- Supabase Free Tier"
        echo "- Upstash Free Tier"
        echo "- Vercel Hobby"
        echo "- Let's Encrypt SSL"
    elif [ $users -le 10000 ]; then
        print_warning "Growth Phase: Invest in reliable infrastructure"
        echo "Recommended Stack:"
        echo "- Supabase Pro"
        echo "- Upstash Pro"
        echo "- Vercel Pro"
        echo "- Cloudflare Pro"
    else
        print_error "Scale Phase: Enterprise-grade infrastructure needed"
        echo "Recommended Stack:"
        echo "- Supabase Team or AWS RDS"
        echo "- Redis Cloud or AWS ElastiCache"
        echo "- Vercel Enterprise"
        echo "- Cloudflare Business"
    fi
}

# Function to show cost scenarios
show_scenarios() {
    print_header "\n📈 Cost Scenarios by User Count"
    echo "======================================"
    
    local scenarios=(
        "100:0:1"
        "1000:25:5"
        "5000:25:10"
        "10000:25:20"
        "25000:25:50"
        "50000:599:100"
        "100000:599:200"
        "250000:1000:500"
        "500000:1000:1000"
    )
    
    printf "%-12s %-15s %-15s %-15s %-15s\n" "Users" "Database" "Redis" "CDN" "Total"
    echo "----------------------------------------------------------------"
    
    for scenario in "${scenarios[@]}"; do
        IFS=':' read -r users db_cost bandwidth <<< "$scenario"
        
        local redis_cost=$(calculate_redis_cost $users)
        local cdn_cost=$(calculate_cdn_cost $users $bandwidth)
        local backup_cost=$(calculate_backup_cost $bandwidth)
        local monitoring_cost=$(calculate_monitoring_cost $users)
        local total=$(echo "$db_cost + $redis_cost + $cdn_cost + $backup_cost + $monitoring_cost" | bc -l 2>/dev/null || echo "0")
        
        printf "%-12s $%-14s $%-14s $%-14s $%-14s\n" "$users" "$db_cost" "$redis_cost" "$cdn_cost" "$total"
    done
}

# Function to show provider comparison
show_provider_comparison() {
    print_header "\n🏢 Provider Comparison"
    echo "========================"
    
    echo "Database Providers:"
    echo "  Supabase:     $0-599/month (Free to Team)"
    echo "  Neon:         $0-50/month (Serverless)"
    echo "  Railway:      $5-100/month (Easy setup)"
    echo "  AWS RDS:      $12-1000+/month (Enterprise)"
    echo "  Google Cloud: $7-1000+/month (Enterprise)"
    echo ""
    
    echo "Redis Providers:"
    echo "  Upstash:      $0-25/month (Serverless)"
    echo "  Redis Cloud:  $0-50+/month (Managed)"
    echo "  Railway:      $5-20/month (Easy setup)"
    echo "  AWS ElastiCache: $12-100+/month (Enterprise)"
    echo ""
    
    echo "CDN Providers:"
    echo "  Vercel:       $0-500+/month (Built-in)"
    echo "  Cloudflare:   $0-200/month (Popular)"
    echo "  AWS CloudFront: $10-100+/month (Enterprise)"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    print_header "Choose an option:"
    echo "1. Calculate costs for your specific needs"
    echo "2. View cost scenarios by user count"
    echo "3. Compare provider costs"
    echo "4. Exit"
    echo ""
}

# Main execution
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-4): " choice
        
        case $choice in
            1)
                echo ""
                local users=$(get_input "Enter number of monthly active users" "1000")
                local storage=$(get_input "Enter database storage needed (GB)" "10")
                local bandwidth=$(get_input "Enter monthly bandwidth (GB)" "100")
                
                calculate_costs $users $storage $bandwidth
                ;;
            2)
                show_scenarios
                ;;
            3)
                show_provider_comparison
                ;;
            4)
                print_success "Thank you for using the cost calculator!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-4."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    print_warning "bc calculator not found. Some calculations may be simplified."
fi

# Start the calculator
main 