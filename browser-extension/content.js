// RevSnap Browser Extension - Content Script

class RevSnapContent {
  constructor() {
    this.priceElements = []
    this.isInjected = false
    this.init()
  }

  init() {
    // Don't inject multiple times
    if (window.revSnapInjected) return
    window.revSnapInjected = true

    this.injectPriceCheckers()
    this.setupMutationObserver()
    this.setupMessageListener()
  }

  injectPriceCheckers() {
    // Find price elements and add RevSnap indicators
    const priceSelectors = this.getPriceSelectors()
    
    priceSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => this.addPriceChecker(el))
    })
  }

  getPriceSelectors() {
    const hostname = window.location.hostname

    if (hostname.includes('amazon.com')) {
      return [
        '.a-price',
        '.a-price-whole',
        '#price_inside_buybox'
      ]
    } else if (hostname.includes('walmart.com')) {
      return [
        '[data-testid="price-current"]',
        '[itemprop="price"]',
        '.price-current'
      ]
    } else if (hostname.includes('target.com')) {
      return [
        '[data-test="product-price"]',
        '.h-price-current'
      ]
    } else if (hostname.includes('bestbuy.com')) {
      return [
        '.pricing-current-price',
        '.sr-only'
      ]
    } else if (hostname.includes('shopify.com') || hostname.includes('myshopify.com')) {
      return [
        '.price',
        '.product-price',
        '.money',
        '[class*="price"]'
      ]
    }

    return []
  }

  addPriceChecker(priceElement) {
    // Skip if already processed
    if (priceElement.dataset.revsnap) return
    priceElement.dataset.revsnap = 'true'

    // Create RevSnap indicator
    const indicator = document.createElement('div')
    indicator.className = 'revsnap-price-indicator'
    indicator.innerHTML = `
      <div class="revsnap-badge">
        <span class="revsnap-icon">📊</span>
        <span class="revsnap-text">Check with RevSnap</span>
      </div>
    `

    // Add click handler
    indicator.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.analyzePrice(priceElement)
    })

    // Position near price element
    priceElement.style.position = 'relative'
    priceElement.appendChild(indicator)

    this.priceElements.push(priceElement)
  }

  async analyzePrice(priceElement) {
    try {
      // Extract product data
      const product = this.extractProductData()
      if (!product) return

      // Show loading state
      this.showPriceAnalysis(priceElement, { loading: true })

      // Send to background script for analysis
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_PRICE',
        product: product
      })

      if (response?.success) {
        this.showPriceAnalysis(priceElement, response.data)
      } else {
        this.showPriceAnalysis(priceElement, { error: 'Analysis failed' })
      }
    } catch (error) {
      console.error('Price analysis failed:', error)
      this.showPriceAnalysis(priceElement, { error: 'Analysis failed' })
    }
  }

  showPriceAnalysis(priceElement, data) {
    // Remove existing analysis
    const existing = priceElement.querySelector('.revsnap-analysis')
    if (existing) existing.remove()

    const analysis = document.createElement('div')
    analysis.className = 'revsnap-analysis'

    if (data.loading) {
      analysis.innerHTML = `
        <div class="revsnap-loading">
          <div class="revsnap-spinner"></div>
          <span>Analyzing...</span>
        </div>
      `
    } else if (data.error) {
      analysis.innerHTML = `
        <div class="revsnap-error">
          <span>❌ ${data.error}</span>
        </div>
      `
    } else {
      analysis.innerHTML = `
        <div class="revsnap-results">
          <div class="revsnap-comparison">
            <div class="revsnap-metric">
              <span class="revsnap-label">Market Avg:</span>
              <span class="revsnap-value">$${data.marketAverage?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="revsnap-metric">
              <span class="revsnap-label">Best Price:</span>
              <span class="revsnap-value">$${data.bestPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="revsnap-metric">
              <span class="revsnap-label">Position:</span>
              <span class="revsnap-value ${data.position === 'Competitive' ? 'competitive' : 'above-market'}">
                ${data.position || 'Unknown'}
              </span>
            </div>
          </div>
          <div class="revsnap-actions">
            <button class="revsnap-btn revsnap-track">Track Product</button>
            <button class="revsnap-btn revsnap-compare">Compare Similar</button>
          </div>
        </div>
      `

      // Add action handlers
      analysis.querySelector('.revsnap-track')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'TRACK_PRODUCT', product: data.product })
      })

      analysis.querySelector('.revsnap-compare')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'COMPARE_SIMILAR', product: data.product })
      })
    }

    priceElement.appendChild(analysis)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (analysis.parentNode) {
        analysis.remove()
      }
    }, 10000)
  }

  extractProductData() {
    const product = {
      title: '',
      price: 0,
      brand: '',
      sku: '',
      url: window.location.href,
      site: window.location.hostname
    }

    // Use same extraction logic as popup.js
    const hostname = window.location.hostname

    if (hostname.includes('amazon.com')) {
      product.title = document.querySelector('#productTitle')?.textContent?.trim() || ''
      const priceEl = document.querySelector('.a-price .a-offscreen') || 
                     document.querySelector('.a-price-whole')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
      product.brand = document.querySelector('#bylineInfo')?.textContent?.trim() || ''
    } else if (hostname.includes('walmart.com')) {
      product.title = document.querySelector('[data-testid="product-title"]')?.textContent?.trim() || ''
      const priceEl = document.querySelector('[itemprop="price"]') ||
                     document.querySelector('[data-testid="price-current"]')
      if (priceEl) {
        product.price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
      }
    }
    // ... other sites similar to popup.js

    return product.title && product.price > 0 ? product : null
  }

  setupMutationObserver() {
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // Re-inject price checkers for new content
          setTimeout(() => this.injectPriceCheckers(), 500)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'EXTRACT_PRODUCT_DATA':
          sendResponse(this.extractProductData())
          break
        case 'HIGHLIGHT_PRICES':
          this.highlightAllPrices()
          break
      }
    })
  }

  highlightAllPrices() {
    this.priceElements.forEach(el => {
      el.style.outline = '2px solid #2563eb'
      el.style.outlineOffset = '2px'
    })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      this.priceElements.forEach(el => {
        el.style.outline = ''
        el.style.outlineOffset = ''
      })
    }, 3000)
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new RevSnapContent())
} else {
  new RevSnapContent()
}

// Handle page navigation for SPAs
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    setTimeout(() => new RevSnapContent(), 1000)
  }
}).observe(document, { subtree: true, childList: true }) 