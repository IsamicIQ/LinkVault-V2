const SUPABASE_URL = 'https://hwcixfsxatizosadsnxo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2l4ZnN4YXRpem9zYWRzbnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTQwNDUsImV4cCI6MjA4MDA3MDA0NX0.u3VC_tY0_YtjJSIi-x_7vVpoJ3j-X_D2oRWZrsb59JI'

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function getSession() {
  // Try to get session from localStorage via content script
  // Prefer the LinkVault dashboard tab (where the content script is injected)
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      if (!tabs || tabs.length === 0) {
        resolve(null)
        return
      }

      // Look for an open LinkVault dashboard tab first
      const dashboardTab = tabs.find(tab => {
        const url = tab.url || ''
        return url.startsWith('http://localhost:3001') || url.startsWith('https://localhost:3001')
      })

      // Fall back to the current active tab if no dashboard tab is found
      const activeTab = tabs.find(tab => tab.active && tab.currentWindow)
      const targetTab = dashboardTab || activeTab || tabs[0]

      if (!targetTab?.id) {
        resolve(null)
        return
      }

      chrome.tabs.sendMessage(
        targetTab.id,
        { action: 'getSession' },
        (response) => {
          // If content script isn't injected, response will be undefined
          const session = response?.session || null
          resolve(session)
        }
      )
    })
  })
}

async function checkAuth() {
  const session = await getSession()
  if (!session) return false

  try {
    // Validate the Supabase session by fetching the current user
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}

async function saveLink(url, notes = '') {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated. Please log in to LinkVault first.')

  // Get title from current tab (already available, no need to fetch metadata)
  const tab = await getCurrentTab()
  const domain = extractDomain(url)
  let title = tab.title || domain || 'Untitled Link'
  
  // Clean up title if it's just the URL
  if (title === url || title === domain) {
    title = domain || 'Untitled Link'
  }

  // Save link immediately - no metadata fetching needed
  const response = await fetch(`${SUPABASE_URL}/rest/v1/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      url,
      title: title,
      description: null,
      thumbnail_url: null,
      domain: domain || null,
      notes: notes.trim() || null,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save link')
  }

  return await response.json()
}

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status')
  statusDiv.className = `status ${type}`
  statusDiv.textContent = message
  statusDiv.style.display = 'block'

  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none'
    }, 3000)
  }
}

async function init() {
  const tab = await getCurrentTab()
  const urlInput = document.getElementById('urlInput')
  urlInput.value = tab.url

  const isAuthenticated = await checkAuth()
  
  if (isAuthenticated) {
    document.getElementById('loginSection').style.display = 'none'
    document.getElementById('saveSection').style.display = 'block'
  } else {
    document.getElementById('loginSection').style.display = 'block'
    document.getElementById('saveSection').style.display = 'none'
  }

  // Save button
  document.getElementById('saveButton').addEventListener('click', async () => {
    const button = document.getElementById('saveButton')
    button.disabled = true
    button.textContent = 'Saving...'

    try {
      const notes = document.getElementById('notesInput').value
      await saveLink(tab.url, notes)
      showStatus('Link saved successfully!', 'success')
      document.getElementById('notesInput').value = ''
    } catch (error) {
      showStatus(error.message || 'Failed to save link', 'error')
    } finally {
      button.disabled = false
      button.textContent = 'Save Link'
    }
  })

  // Open dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001/dashboard' })
  })

  // Config link
  document.getElementById('configLink').addEventListener('click', (e) => {
    e.preventDefault()
    chrome.tabs.create({ url: 'http://localhost:3001/dashboard' })
  })
}

// Listen for auth updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_UPDATE') {
    init()
  }
})

init()
