/**
 * User Agent parsing utilities
 * Production-ready user agent detection
 */

export interface ParsedUserAgent {
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Parse user agent string to extract browser and OS information
 * @param userAgent - The user agent string from the request
 * @returns Parsed user agent information
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  // Production-ready validation
  if (!userAgent || typeof userAgent !== 'string' || userAgent.trim().length === 0) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  let browserVersion: string | undefined;
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
    const match = ua.match(/(?:opera|opr)\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  // OS detection
  let os = 'Unknown';
  let osVersion: string | undefined;
  
  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac os x') || ua.includes('macos')) {
    os = 'macOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android (\d+\.\d+)/);
    if (match) osVersion = match[1];
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  }

  // Device detection
  let device = 'Desktop';
  let isMobile = false;
  let isTablet = false;
  let isDesktop = true;

  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    device = 'Mobile';
    isMobile = true;
    isDesktop = false;
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    device = 'Tablet';
    isTablet = true;
    isDesktop = false;
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    isMobile,
    isTablet,
    isDesktop
  };
}

/**
 * Get a friendly display name for the user's browser and OS
 * @param parsed - Parsed user agent information
 * @returns Friendly display string
 */
export function getFriendlyDisplayName(parsed: ParsedUserAgent): string {
  const browser = parsed.browserVersion 
    ? `${parsed.browser} ${parsed.browserVersion}`
    : parsed.browser;
  
  const os = parsed.osVersion 
    ? `${parsed.os} ${parsed.osVersion}`
    : parsed.os;
  
  return `${browser} on ${os}`;
}

/**
 * Get a short display name for the user's browser and device
 * @param parsed - Parsed user agent information
 * @returns Short display string
 */
export function getShortDisplayName(parsed: ParsedUserAgent): string {
  return `${parsed.browser} • ${parsed.device}`;
}
