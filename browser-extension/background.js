// RevSnap Browser Extension - Background Service Worker

class RevSnapBackground {
  constructor() {
    this.init()
  }

  init() {
    this.setupContextMenus()
    this.setupCommands()
    this.setupNotifications()
    this.setupStorageListeners()
  }

  setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      // Create context menu for product links
      chrome.contextMenus.create({
        id: 'revsnap-check-price',
        title: 'Check price with RevSnap',
        contexts: ['link', 'page'],
        targetUrlPatterns: [
          '*://*.amazon.com/*',
          '*://*.walmart.com/*',
          '*://*.target.com/*',
          '*://*.bestbuy.com/*',
          '*://*.shopify.com/*',
          '*://*.myshopify.com/*'
        ]
      })

      chrome.contextMenus.create({
        id: 'revsnap-track-product',
        title: 'Track this product',
        contexts: ['page'],
        targetUrlPatterns: [
          '*://*.amazon.com/*',
          '*://*.walmart.com/*',
          '*://*.target.com/*',
          '*://*.bestbuy.com/*',
          '*://*.shopify.com/*',
          '*://*.myshopify.com/*'
        ]
      })

      chrome.contextMenus.create({
        id: 'revsnap-separator',
        type: 'separator',
        contexts: ['page']
      })

      chrome.contextMenus.create({
        id: 'revsnap-dashboard',
        title: 'Open RevSnap Dashboard',
        contexts: ['page']
      })
    })

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab)
    })
  }

  setupCommands() {
    chrome.commands.onCommand.addListener((command) => {
      switch (command) {
        case 'quick-check':
          this.performQuickCheck()
          break
      }
    })
  }

  setupNotifications() {
    // Listen for price alert notifications
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name.startsWith('price-alert-')) {
        this.checkPriceAlerts()
      }
    })

    // Set up periodic price checking
    chrome.alarms.create('price-check', { periodInMinutes: 60 })
  }

  setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.authToken) {
        if (changes.authToken.newValue) {
          this.onUserLogin()
        } else {
          this.onUserLogout()
        }
      }
    })
  }

  async handleContextMenuClick(info, tab) {
    switch (info.menuItemId) {
      case 'revsnap-check-price':
        await this.checkPrice(tab)
        break
      case 'revsnap-track-product':
        await this.trackProduct(tab)
        break
      case 'revsnap-dashboard':
        chrome.tabs.create({ url: 'https://revsnap.com/dashboard' })
        break
    }
  }

  async checkPrice(tab) {
    try {
      // Inject content script to extract product data
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractProductData
      })

      if (results[0]?.result) {
        const product = results[0].result
        
        // Show notification with price info
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'RevSnap Price Check',
          message: `${product.title}\nCurrent Price: $${product.price.toFixed(2)}\nClick to see full analysis`
        })

        // Store for popup access
        chrome.storage.local.set({ lastCheckedProduct: product })
      }
    } catch (error) {
      console.error('Price check failed:', error)
    }
  }

  async trackProduct(tab) {
    try {
      const { authToken } = await chrome.storage.sync.get(['authToken'])
      
      if (!authToken) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Login Required',
          message: 'Please login to RevSnap to track products'
        })
        return
      }

      // Extract product data and add to tracking
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractProductData
      })

      if (results[0]?.result) {
        const product = results[0].result
        
        // Add to RevSnap tracking
        const response = await fetch('https://revsnap.com/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            name: product.title,
            url: product.url,
            price: product.price,
            brand: product.brand,
            sku: product.sku || Date.now().toString()
          })
        })

        if (response.ok) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Product Added',
            message: `${product.title} is now being tracked by RevSnap`
          })
        }
      }
    } catch (error) {
      console.error('Track product failed:', error)
    }
  }

  async performQuickCheck() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    await this.checkPrice(tab)
  }

  async checkPriceAlerts() {
    try {
      const { authToken } = await chrome.storage.sync.get(['authToken'])
      if (!authToken) return

      // Check for price alerts from RevSnap API
      const response = await fetch('https://revsnap.com/api/alerts/check', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (response.ok) {
        const alerts = await response.json()
        
        alerts.forEach(alert => {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'RevSnap Price Alert',
            message: `${alert.productName}: ${alert.message}`,
            buttons: [
              { title: 'View Details' },
              { title: 'Dismiss' }
            ]
          })
        })
      }
    } catch (error) {
      console.error('Price alert check failed:', error)
    }
  }

  onUserLogin() {
    // Set up user-specific features
    chrome.alarms.create('user-price-check', { periodInMinutes: 30 })
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'RevSnap Connected',
      message: 'Successfully connected to your RevSnap account'
    })
  }

  onUserLogout() {
    // Clean up user-specific features
    chrome.alarms.clear('user-price-check')
    chrome.storage.local.clear()
  }

  // Product extraction function (same as in popup.js)
  extractProductData() {
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
}

// Initialize background service
new RevSnapBackground()

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: 'https://revsnap.com/dashboard' })
})

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // View Details
    chrome.tabs.create({ url: 'https://revsnap.com/dashboard' })
  }
  chrome.notifications.clear(notificationId)
}) 