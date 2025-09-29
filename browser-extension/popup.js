// RevSnap Browser Extension - Popup Script

class RevSnapExtension {
  constructor() {
    this.apiBase = 'https://revsnap.com/api'
    this.isAuthenticated = false
    this.currentProduct = null
    this.init()
  }

  async init() {
    await this.checkAuthStatus()
    this.setupEventListeners()
    this.setupKeyboardShortcuts()
    await this.analyzeCurrentPage()
  }

  async checkAuthStatus() {
    try {
      const { authToken } = await chrome.storage.sync.get(['authToken'])
      if (authToken) {
        const response = await fetch(`${this.apiBase}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
        
        if (response.ok) {
          const user = await response.json()
          this.isAuthenticated = true
          this.showLoggedInState(user)
        } else {
          this.showLoggedOutState()
        }
      } else {
        this.showLoggedOutState()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      this.showLoggedOutState()
    }
  }

  setupEventListeners() {
    // Authentication
    document.getElementById('login-btn').addEventListener('click', () => this.handleLogin())
    document.getElementById('guest-mode').addEventListener('click', () => this.enableGuestMode())
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout())

    // Quick Actions
    document.getElementById('check-current').addEventListener('click', () => this.checkCurrentProduct())
    document.getElementById('track-product').addEventListener('click', () => this.trackCurrentProduct())
    document.getElementById('compare-similar').addEventListener('click', () => this.findSimilarProducts())

    // Footer actions
    document.getElementById('open-dashboard').addEventListener('click', () => this.openDashboard())
    document.getElementById('settings').addEventListener('click', () => this.openSettings())
    document.getElementById('retry-btn').addEventListener('click', () => this.retryLastAction())
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            this.checkCurrentProduct()
            break
          case '2':
            e.preventDefault()
            this.trackCurrentProduct()
            break
          case '3':
            e.preventDefault()
            this.findSimilarProducts()
            break
        }
      }
    })
  }

  showLoggedInState(user) {
    document.getElementById('logged-out').classList.add('hidden')
    document.getElementById('logged-in').classList.remove('hidden')
    document.getElementById('user-name').textContent = user.name || user.email
  }

  showLoggedOutState() {
    document.getElementById('logged-in').classList.add('hidden')
    document.getElementById('logged-out').classList.remove('hidden')
  }

  async handleLogin() {
    try {
      // Open RevSnap auth page in new tab
      const authUrl = `${this.apiBase.replace('/api', '')}/auth/extension-login`
      await chrome.tabs.create({ url: authUrl })
      
      // Listen for auth success message
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'AUTH_SUCCESS') {
          chrome.storage.sync.set({ authToken: message.token })
          this.checkAuthStatus()
        }
      })
    } catch (error) {
      this.showError('Failed to authenticate. Please try again.')
    }
  }

  enableGuestMode() {
    this.isAuthenticated = false
    document.getElementById('auth-section').classList.add('hidden')
    this.analyzeCurrentPage()
  }

  async handleLogout() {
    await chrome.storage.sync.remove(['authToken'])
    this.isAuthenticated = false
    this.showLoggedOutState()
  }

  async analyzeCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!this.isSupportedSite(tab.url)) {
        this.showError('This site is not supported for price analysis.')
        return
      }

      this.showLoading('Analyzing current page...')

      // Inject content script to extract product data
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractProductData
      })

      if (results[0]?.result) {
        this.currentProduct = results[0].result
        await this.analyzeProduct(this.currentProduct)
      } else {
        this.showError('No product found on this page.')
      }
    } catch (error) {
      console.error('Page analysis failed:', error)
      this.showError('Failed to analyze page. Please try again.')
    }
  }

  async checkCurrentProduct() {
    if (!this.currentProduct) {
      await this.analyzeCurrentPage()
    } else {
      await this.analyzeProduct(this.currentProduct)
    }
  }

  async trackCurrentProduct() {
    if (!this.currentProduct) {
      this.showError('No product detected on current page.')
      return
    }

    if (!this.isAuthenticated) {
      this.showError('Please login to track products.')
      return
    }

    try {
      this.showLoading('Adding product to tracking...')

      const { authToken } = await chrome.storage.sync.get(['authToken'])
      const response = await fetch(`${this.apiBase}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: this.currentProduct.title,
          url: this.currentProduct.url,
          price: this.currentProduct.price,
          brand: this.currentProduct.brand,
          sku: this.currentProduct.sku || Date.now().toString()
        })
      })

      if (response.ok) {
        this.showSuccess('Product added to tracking!')
        setTimeout(() => this.hideMessage(), 2000)
      } else {
        this.showError('Failed to add product to tracking.')
      }
    } catch (error) {
      this.showError('Failed to track product. Please try again.')
    }
  }

  async findSimilarProducts() {
    if (!this.currentProduct) {
      this.showError('No product detected on current page.')
      return
    }

    try {
      this.showLoading('Finding similar products...')

      const searchQuery = encodeURIComponent(this.currentProduct.title)
      const searchUrl = `${this.apiBase.replace('/api', '')}/competitor-tracking?search=${searchQuery}`
      
      await chrome.tabs.create({ url: searchUrl })
      window.close()
    } catch (error) {
      this.showError('Failed to search for similar products.')
    }
  }

  async analyzeProduct(product) {
    try {
      this.showLoading('Analyzing pricing data...')

      // Mock API call - in real implementation, call RevSnap API
      const analysisData = await this.mockPriceAnalysis(product)

      this.showProductInfo(product, analysisData)
    } catch (error) {
      this.showError('Failed to analyze product pricing.')
    }
  }

  async mockPriceAnalysis(product) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock analysis data
    const currentPrice = product.price
    const marketAvg = currentPrice * (0.9 + Math.random() * 0.2)
    const bestPrice = currentPrice * (0.8 + Math.random() * 0.15)
    
    return {
      marketAverage: marketAvg,
      bestPrice: bestPrice,
      position: currentPrice <= marketAvg ? 'Competitive' : 'Above Market',
      recommendation: currentPrice > marketAvg 
        ? `Consider reducing price by $${(currentPrice - marketAvg).toFixed(2)} to match market average.`
        : 'Your pricing is competitive! Consider slight increase for higher margins.'
    }
  }

  showProductInfo(product, analysis) {
    this.hideLoading()
    this.hideError()

    // Show product info
    document.getElementById('product-info').classList.remove('hidden')
    document.getElementById('product-title').textContent = product.title
    document.getElementById('current-price').textContent = `$${product.price.toFixed(2)}`
    document.getElementById('product-brand').textContent = product.brand || 'Unknown Brand'
    document.getElementById('product-site').textContent = product.site

    // Show analysis
    document.getElementById('market-avg').textContent = `$${analysis.marketAverage.toFixed(2)}`
    document.getElementById('best-price').textContent = `$${analysis.bestPrice.toFixed(2)}`
    document.getElementById('price-position').textContent = analysis.position

    // Show recommendation
    document.getElementById('rec-content').textContent = analysis.recommendation
    document.getElementById('recommendations').classList.remove('hidden')
  }

  extractProductData() {
    // This function runs in the context of the webpage
    const product = {
      title: '',
      price: 0,
      brand: '',
      sku: '',
      url: window.location.href,
      site: window.location.hostname
    }

    // Amazon extraction
    if (window.location.hostname.includes('amazon.com')) {
      product.title = document.querySelector('#productTitle')?.textContent?.trim() || ''
      const priceEl = document.querySelector('.a-price .a-offscreen') || 
                     document.querySelector('.a-price-whole')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
      product.brand = document.querySelector('#bylineInfo')?.textContent?.trim() || ''
    }

    // Walmart extraction
    else if (window.location.hostname.includes('walmart.com')) {
      product.title = document.querySelector('[data-testid="product-title"]')?.textContent?.trim() || ''
      const priceEl = document.querySelector('[itemprop="price"]') ||
                     document.querySelector('[data-testid="price-current"]')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
    }

    // Target extraction
    else if (window.location.hostname.includes('target.com')) {
      product.title = document.querySelector('[data-test="product-title"]')?.textContent?.trim() || ''
      const priceEl = document.querySelector('[data-test="product-price"]')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
    }

    // Best Buy extraction
    else if (window.location.hostname.includes('bestbuy.com')) {
      product.title = document.querySelector('.sr-only')?.textContent?.trim() || ''
      const priceEl = document.querySelector('.pricing-current-price')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
    }

    // Shopify store extraction (generic)
    else if (document.querySelector('[data-shopify]') || window.Shopify) {
      product.title = document.querySelector('.product-title, .product__title, h1')?.textContent?.trim() || ''
      const priceEl = document.querySelector('.price, .product-price, .money') ||
                     document.querySelector('[class*="price"]')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
    }

    return product.title && product.price > 0 ? product : null
  }

  isSupportedSite(url) {
    const supportedDomains = [
      'amazon.com',
      'walmart.com', 
      'target.com',
      'bestbuy.com',
      'ebay.com',
      'shopify.com'
    ]
    
    return supportedDomains.some(domain => url.includes(domain)) || 
           url.includes('myshopify.com')
  }

  openDashboard() {
    chrome.tabs.create({ url: 'https://revsnap.com/dashboard' })
  }

  openSettings() {
    chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/options.html' })
  }

  showLoading(message = 'Loading...') {
    document.getElementById('loading').classList.remove('hidden')
    document.getElementById('loading').querySelector('p').textContent = message
    document.getElementById('product-info').classList.add('hidden')
    document.getElementById('error').classList.add('hidden')
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden')
  }

  showError(message) {
    document.getElementById('error').classList.remove('hidden')
    document.getElementById('error-message').textContent = message
    document.getElementById('loading').classList.add('hidden')
    document.getElementById('product-info').classList.add('hidden')
  }

  hideError() {
    document.getElementById('error').classList.add('hidden')
  }

  showSuccess(message) {
    // Create temporary success message
    const successDiv = document.createElement('div')
    successDiv.className = 'success'
    successDiv.innerHTML = `
      <div style="background: #10b981; color: white; padding: 12px; text-align: center; font-size: 13px;">
        ✓ ${message}
      </div>
    `
    document.body.appendChild(successDiv)
  }

  hideMessage() {
    const success = document.querySelector('.success')
    if (success) success.remove()
  }

  retryLastAction() {
    this.analyzeCurrentPage()
  }
}

// Initialize extension when popup opens
document.addEventListener('DOMContentLoaded', () => {
  new RevSnapExtension()
}) 