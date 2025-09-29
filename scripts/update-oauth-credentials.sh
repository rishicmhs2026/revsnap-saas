#!/bin/bash

# RevSnap OAuth Credentials Update Script
# This script helps you securely update OAuth credentials in your .env file

set -e  # Exit on any error

echo "🔐 RevSnap OAuth Credentials Update"
echo "=================================="
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Creating .env file from env.example..."
    cp env.example .env
    print_status ".env file created from env.example"
fi

# Function to safely update environment variable
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local file_path=".env"
    
    # Escape special characters in the value
    escaped_value=$(echo "$var_value" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    # Check if variable already exists
    if grep -q "^${var_name}=" "$file_path"; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${var_name}=.*/${var_name}=\"${escaped_value}\"/" "$file_path"
        else
            # Linux
            sed -i "s/^${var_name}=.*/${var_name}=\"${escaped_value}\"/" "$file_path"
        fi
        print_status "Updated ${var_name}"
    else
        # Add new variable
        echo "${var_name}=\"${var_value}\"" >> "$file_path"
        print_status "Added ${var_name}"
    fi
}

# Function to generate secure random string
generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 32
    elif command -v node >/dev/null 2>&1; then
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    else
        # Fallback: use /dev/urandom
        head -c 32 /dev/urandom | base64
    fi
}

echo "This script will help you update OAuth credentials in your .env file."
echo ""

# Step 1: Generate or update NextAuth secret
print_info "Step 1: NextAuth Secret"
echo "Generating secure NextAuth secret..."
NEXTAUTH_SECRET=$(generate_secret)
update_env_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET"
echo ""

# Step 2: Google OAuth credentials
print_info "Step 2: Google OAuth Credentials"
echo "Have you completed the Google Cloud Console setup? (y/n)"
read -r google_setup

if [[ "$google_setup" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please enter your Google OAuth credentials:"
    
    # Get Google Client ID
    echo -n "Google Client ID: "
    read -r google_client_id
    
    # Get Google Client Secret (hidden input)
    echo -n "Google Client Secret: "
    read -s google_client_secret
    echo ""  # New line after hidden input
    
    # Validate inputs
    if [[ -z "$google_client_id" || -z "$google_client_secret" ]]; then
        print_error "Google OAuth credentials cannot be empty!"
        exit 1
    fi
    
    # Validate Client ID format (basic check)
    if [[ ! "$google_client_id" =~ \.googleusercontent\.com$ ]]; then
        print_warning "Google Client ID doesn't look like a valid format (should end with .googleusercontent.com)"
        echo "Continue anyway? (y/n)"
        read -r continue_anyway
        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
            print_error "Aborting..."
            exit 1
        fi
    fi
    
    # Update Google OAuth credentials
    update_env_var "GOOGLE_CLIENT_ID" "$google_client_id"
    update_env_var "GOOGLE_CLIENT_SECRET" "$google_client_secret"
    echo ""
    print_status "Google OAuth credentials updated successfully!"
else
    print_warning "Please complete the Google Cloud Console setup first."
    print_info "See GOOGLE_OAUTH_SETUP.md for detailed instructions."
fi

echo ""

# Step 3: GitHub OAuth credentials (optional)
print_info "Step 3: GitHub OAuth Credentials (Optional)"
echo "Do you want to set up GitHub OAuth as well? (y/n)"
read -r github_setup

if [[ "$github_setup" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please enter your GitHub OAuth credentials:"
    
    # Get GitHub Client ID
    echo -n "GitHub Client ID: "
    read -r github_client_id
    
    # Get GitHub Client Secret (hidden input)
    echo -n "GitHub Client Secret: "
    read -s github_client_secret
    echo ""  # New line after hidden input
    
    # Validate inputs
    if [[ -z "$github_client_id" || -z "$github_client_secret" ]]; then
        print_error "GitHub OAuth credentials cannot be empty!"
        exit 1
    fi
    
    # Update GitHub OAuth credentials
    update_env_var "GITHUB_CLIENT_ID" "$github_client_id"
    update_env_var "GITHUB_CLIENT_SECRET" "$github_client_secret"
    echo ""
    print_status "GitHub OAuth credentials updated successfully!"
else
    print_info "Skipping GitHub OAuth setup."
fi

echo ""
echo "🎉 OAuth Credentials Update Complete!"
echo "======================================"
echo ""
print_status "Your .env file has been updated with:"
echo "  • Secure NextAuth secret"
if [[ "$google_setup" =~ ^[Yy]$ ]]; then
    echo "  • Google OAuth credentials"
fi
if [[ "$github_setup" =~ ^[Yy]$ ]]; then
    echo "  • GitHub OAuth credentials"
fi

echo ""
print_info "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test the OAuth flow at: http://localhost:3000/auth/signin"
echo "3. Verify Google (and GitHub) login buttons appear and work"

echo ""
print_warning "Security reminder:"
echo "• Never commit .env file to version control"
echo "• Use different credentials for production"
echo "• Regularly rotate your OAuth secrets"

echo ""
echo "Happy coding! 🚀"