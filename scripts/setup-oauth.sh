#!/bin/bash

# RevSnap OAuth Setup Script
# This script helps you configure OAuth providers for RevSnap

echo "🚀 RevSnap OAuth Configuration Setup"
echo "======================================"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for input with validation
prompt_for_input() {
    local prompt="$1"
    local var_name="$2"
    local validation_regex="$3"
    local value=""
    
    while true; do
        echo -n "$prompt: "
        read -r value
        
        if [[ -z "$value" ]]; then
            echo "❌ This field is required. Please try again."
            continue
        fi
        
        if [[ -n "$validation_regex" ]] && ! [[ "$value" =~ $validation_regex ]]; then
            echo "❌ Invalid format. Please try again."
            continue
        fi
        
        break
    done
    
    eval "$var_name='$value'"
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy env.example to .env first:"
    echo "cp env.example .env"
    exit 1
fi

echo "This script will help you configure OAuth providers for RevSnap."
echo "You'll need to have already created OAuth applications for:"
echo "  • Google Cloud Console (https://console.cloud.google.com/)"
echo "  • GitHub Developer Settings (https://github.com/settings/developers)"
echo ""

# Ask if user wants to proceed
echo -n "Do you want to continue? (y/N): "
read -r proceed
if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "📋 OAuth Provider Configuration"
echo "==============================="

# Google OAuth Configuration
echo ""
echo "🔵 Google OAuth Configuration"
echo "------------------------------"
echo "If you haven't set up Google OAuth yet, please visit:"
echo "https://console.cloud.google.com/ and create OAuth 2.0 credentials"
echo ""

echo -n "Do you want to configure Google OAuth? (y/N): "
read -r setup_google

if [[ "$setup_google" =~ ^[Yy]$ ]]; then
    prompt_for_input "Google Client ID" GOOGLE_CLIENT_ID
    prompt_for_input "Google Client Secret" GOOGLE_CLIENT_SECRET
    
    # Update .env file
    if grep -q "GOOGLE_CLIENT_ID=" .env; then
        sed -i.bak "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=\"$GOOGLE_CLIENT_ID\"/" .env
    else
        echo "GOOGLE_CLIENT_ID=\"$GOOGLE_CLIENT_ID\"" >> .env
    fi
    
    if grep -q "GOOGLE_CLIENT_SECRET=" .env; then
        sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=\"$GOOGLE_CLIENT_SECRET\"/" .env
    else
        echo "GOOGLE_CLIENT_SECRET=\"$GOOGLE_CLIENT_SECRET\"" >> .env
    fi
    
    echo "✅ Google OAuth configured successfully!"
fi

# GitHub OAuth Configuration
echo ""
echo "🐙 GitHub OAuth Configuration"
echo "------------------------------"
echo "If you haven't set up GitHub OAuth yet, please visit:"
echo "https://github.com/settings/developers and create a new OAuth App"
echo ""

echo -n "Do you want to configure GitHub OAuth? (y/N): "
read -r setup_github

if [[ "$setup_github" =~ ^[Yy]$ ]]; then
    prompt_for_input "GitHub Client ID" GITHUB_CLIENT_ID
    prompt_for_input "GitHub Client Secret" GITHUB_CLIENT_SECRET
    
    # Update .env file
    if grep -q "GITHUB_CLIENT_ID=" .env; then
        sed -i.bak "s/GITHUB_CLIENT_ID=.*/GITHUB_CLIENT_ID=\"$GITHUB_CLIENT_ID\"/" .env
    else
        echo "GITHUB_CLIENT_ID=\"$GITHUB_CLIENT_ID\"" >> .env
    fi
    
    if grep -q "GITHUB_CLIENT_SECRET=" .env; then
        sed -i.bak "s/GITHUB_CLIENT_SECRET=.*/GITHUB_CLIENT_SECRET=\"$GITHUB_CLIENT_SECRET\"/" .env
    else
        echo "GITHUB_CLIENT_SECRET=\"$GITHUB_CLIENT_SECRET\"" >> .env
    fi
    
    echo "✅ GitHub OAuth configured successfully!"
fi

# NextAuth Secret Configuration
echo ""
echo "🔐 NextAuth Secret Configuration"
echo "--------------------------------"

if grep -q "your-nextauth-secret-key-here" .env; then
    echo "Generating a secure NextAuth secret..."
    
    # Generate a random secret
    if command_exists openssl; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    elif command_exists python3; then
        NEXTAUTH_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    else
        NEXTAUTH_SECRET="$(date +%s | sha256sum | head -c 32)"
    fi
    
    sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"/" .env
    echo "✅ NextAuth secret generated and configured!"
else
    echo "✅ NextAuth secret already configured!"
fi

# Clean up backup files
rm -f .env.bak

echo ""
echo "🎉 OAuth Configuration Complete!"
echo "================================"
echo ""
echo "Summary of configured providers:"

if grep -q "GOOGLE_CLIENT_ID=" .env && ! grep -q "your-google-client-id" .env; then
    echo "✅ Google OAuth - Configured"
else
    echo "❌ Google OAuth - Not configured"
fi

if grep -q "GITHUB_CLIENT_ID=" .env && ! grep -q "your-github-client-id" .env; then
    echo "✅ GitHub OAuth - Configured"
else
    echo "❌ GitHub OAuth - Not configured"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Visit http://localhost:3000/auth/signin"
echo "3. Test your OAuth integration"
echo ""
echo "📚 For more detailed setup instructions, see OAUTH_SETUP_GUIDE.md"
echo ""
echo "⚠️  Important: Never commit your .env file to version control!"
echo "   Add .env to your .gitignore if it's not already there."