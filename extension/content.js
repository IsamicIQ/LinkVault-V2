// Content script to get session from localStorage
// This runs on the LinkVault dashboard page

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSession') {
    try {
      // Try to get session from Supabase's localStorage
      // Supabase stores session in localStorage with key like 'sb-<project-ref>-auth-token'
      const keys = Object.keys(localStorage)

      // Look for the standard Supabase auth token key
      const supabaseKey =
        keys.find(key => key.startsWith('sb-') && key.includes('-auth-token')) ||
        keys.find(key => key.includes('-auth-token')) ||
        null

      if (!supabaseKey) {
        sendResponse({ session: null })
        return true
      }

      const raw = localStorage.getItem(supabaseKey)
      if (!raw) {
        sendResponse({ session: null })
        return true
      }

      const sessionData = JSON.parse(raw)
      const session = sessionData?.currentSession || sessionData?.session || null

      sendResponse({ session })
    } catch (e) {
      console.error('Error reading Supabase session from localStorage', e)
      sendResponse({ session: null })
    }
  }
  return true // Keep channel open for async response
})

