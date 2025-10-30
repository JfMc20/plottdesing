/**
 * IP Blocker - Block suspicious IPs from accessing the site
 */

// Lista de IPs bloqueadas (puedes moverlo a una base de datos o archivo de configuración)
const BLOCKED_IPS: Set<string> = new Set([
  // Agrega aquí IPs sospechosas
  // '1.2.3.4',
])

// Lista de User Agents bloqueados (bots maliciosos)
const BLOCKED_USER_AGENTS: RegExp[] = [
  /bot/i,              // Bots genéricos (puedes ser más específico)
  /crawler/i,
  /spider/i,
  /scraper/i,
  /scanner/i,
  /nikto/i,            // Scanner de vulnerabilidades
  /sqlmap/i,           // Herramienta de SQL injection
  /nmap/i,             // Scanner de puertos
  /masscan/i,
  /zgrab/i,
  // Bots legítimos que quieres permitir los excluyes aquí
]

// Whitelist de User Agents permitidos (bots buenos)
const ALLOWED_USER_AGENTS: RegExp[] = [
  /googlebot/i,
  /bingbot/i,
  /slackbot/i,
  /twitterbot/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
]

interface RequestInfo {
  ip: string
  userAgent: string
  path: string
}

/**
 * Check if an IP should be blocked
 */
export function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip)
}

/**
 * Check if a User Agent should be blocked
 */
export function isUserAgentBlocked(userAgent: string): boolean {
  // First check if it's in the allowed list
  const isAllowed = ALLOWED_USER_AGENTS.some((pattern) => pattern.test(userAgent))
  if (isAllowed) {
    return false
  }

  // Then check if it's in the blocked list
  return BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent))
}

/**
 * Check if a request should be blocked
 */
export function shouldBlockRequest({ ip, userAgent, path }: RequestInfo): {
  blocked: boolean
  reason?: string
} {
  // Check IP
  if (isIPBlocked(ip)) {
    return { blocked: true, reason: `Blocked IP: ${ip}` }
  }

  // Check User Agent
  if (isUserAgentBlocked(userAgent)) {
    return { blocked: true, reason: `Blocked User Agent: ${userAgent.substring(0, 50)}` }
  }

  // Check suspicious paths
  const suspiciousPaths = [
    '.php',
    '.asp',
    '.aspx',
    '/wp-admin',
    '/wp-login',
    '/xmlrpc.php',
    '/admin.php',
    '/.env',
    '/.git',
    '/config',
    '/phpmyadmin',
  ]

  const hasSuspiciousPath = suspiciousPaths.some((pattern) => path.includes(pattern))
  if (hasSuspiciousPath) {
    return { blocked: true, reason: `Suspicious path: ${path}` }
  }

  return { blocked: false }
}

/**
 * Add an IP to the blocklist
 */
export function blockIP(ip: string): void {
  BLOCKED_IPS.add(ip)
  console.log(`🚫 IP blocked: ${ip}`)
}

/**
 * Remove an IP from the blocklist
 */
export function unblockIP(ip: string): void {
  BLOCKED_IPS.delete(ip)
  console.log(`✅ IP unblocked: ${ip}`)
}

/**
 * Get all blocked IPs
 */
export function getBlockedIPs(): string[] {
  return Array.from(BLOCKED_IPS)
}

/**
 * Rate limiting per IP (simple in-memory implementation)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>()

// Max requests per minute per IP
const MAX_REQUESTS_PER_MINUTE = 60

export function checkRateLimit(ip: string): {
  allowed: boolean
  remaining: number
} {
  const now = Date.now()
  const record = requestCounts.get(ip)

  // If no record or expired, create new
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    })
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 }
  }

  // Increment count
  record.count++

  // Check if exceeded
  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    console.log(`⚠️ Rate limit exceeded for IP: ${ip}`)
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - record.count }
}

// Clean up old records every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(ip)
    }
  }
}, 5 * 60 * 1000)
