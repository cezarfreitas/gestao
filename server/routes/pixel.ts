import { RequestHandler } from "express";

interface PixelEvent {
  id?: string;
  pixelId: string;
  site: string;
  eventType: 'pageview' | 'form_submit' | 'cta_click' | 'custom';
  timestamp: string;
  url: string;
  referrer: string;
  userAgent: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

interface Pixel {
  id: string;
  name: string;
  description: string;
  code: string;
  status: 'active' | 'inactive' | 'testing';
  site: string;
  createdAt: string;
  lastHit: string;
  totalHits: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
}

// Mock data storage (in production, this would be a database)
const mockPixels: Pixel[] = [
  {
    id: "px_001",
    name: "Ecko Streetwear - Homepage",
    description: "Pixel principal para tracking da homepage",
    code: "px_001_ecko_main",
    status: "active",
    site: "https://ecko.com.br",
    createdAt: "2024-01-10T10:00:00.000Z",
    lastHit: "2024-01-15T14:30:00.000Z",
    totalHits: 15420,
    uniqueVisitors: 8930,
    conversions: 234,
    conversionRate: 2.62
  }
];

const mockEvents: PixelEvent[] = [];

// Track pixel events
export const trackPixelEvent: RequestHandler = (req, res) => {
  try {
    const eventData: PixelEvent = req.body;
    
    // Validate required fields
    if (!eventData.pixelId || !eventData.eventType || !eventData.url) {
      return res.status(400).json({ 
        error: 'Missing required fields: pixelId, eventType, url' 
      });
    }
    
    // Find the pixel
    const pixel = mockPixels.find(p => p.code === eventData.pixelId);
    if (!pixel) {
      return res.status(404).json({ 
        error: 'Pixel not found' 
      });
    }
    
    // Check if pixel is active
    if (pixel.status !== 'active' && pixel.status !== 'testing') {
      return res.status(403).json({ 
        error: 'Pixel is not active' 
      });
    }
    
    // Create event record
    const event: PixelEvent = {
      id: Date.now().toString(),
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString()
    };
    
    mockEvents.push(event);
    
    // Update pixel statistics
    pixel.totalHits += 1;
    pixel.lastHit = event.timestamp;
    
    // Simple conversion tracking (form submissions count as conversions)
    if (eventData.eventType === 'form_submit') {
      pixel.conversions += 1;
      pixel.conversionRate = (pixel.conversions / pixel.uniqueVisitors) * 100;
    }
    
    // Return success with minimal data (for performance)
    res.status(200).json({ 
      success: true,
      eventId: event.id 
    });
    
  } catch (error) {
    console.error('Pixel tracking error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get all pixels
export const getPixels: RequestHandler = (req, res) => {
  res.json(mockPixels);
};

// Get pixel by ID
export const getPixelById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const pixel = mockPixels.find(p => p.id === id);
  
  if (!pixel) {
    return res.status(404).json({ error: 'Pixel not found' });
  }
  
  res.json(pixel);
};

// Create new pixel
export const createPixel: RequestHandler = (req, res) => {
  try {
    const { name, description, site } = req.body;
    
    if (!name || !site) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, site' 
      });
    }
    
    const pixelId = `px_${Date.now().toString().slice(-6)}`;
    const code = `${pixelId}_${site.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const newPixel: Pixel = {
      id: pixelId,
      name,
      description: description || '',
      code,
      status: 'testing',
      site,
      createdAt: new Date().toISOString(),
      lastHit: new Date().toISOString(),
      totalHits: 0,
      uniqueVisitors: 0,
      conversions: 0,
      conversionRate: 0
    };
    
    mockPixels.push(newPixel);
    res.status(201).json(newPixel);
    
  } catch (error) {
    console.error('Create pixel error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Update pixel
export const updatePixel: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const pixelIndex = mockPixels.findIndex(p => p.id === id);
  
  if (pixelIndex === -1) {
    return res.status(404).json({ error: 'Pixel not found' });
  }
  
  // Don't allow updating certain fields
  const { id: _, createdAt, totalHits, uniqueVisitors, conversions, conversionRate, ...allowedUpdates } = updates;
  
  mockPixels[pixelIndex] = { 
    ...mockPixels[pixelIndex], 
    ...allowedUpdates 
  };
  
  res.json(mockPixels[pixelIndex]);
};

// Delete pixel
export const deletePixel: RequestHandler = (req, res) => {
  const { id } = req.params;
  const pixelIndex = mockPixels.findIndex(p => p.id === id);
  
  if (pixelIndex === -1) {
    return res.status(404).json({ error: 'Pixel not found' });
  }
  
  mockPixels.splice(pixelIndex, 1);
  res.status(204).send();
};

// Get pixel analytics
export const getPixelAnalytics: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { timeframe = '30d' } = req.query;
  
  const pixel = mockPixels.find(p => p.id === id);
  if (!pixel) {
    return res.status(404).json({ error: 'Pixel not found' });
  }
  
  // Filter events for this pixel
  const pixelEvents = mockEvents.filter(e => e.pixelId === pixel.code);
  
  // Calculate timeframe
  const now = new Date();
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const filteredEvents = pixelEvents.filter(e => 
    new Date(e.timestamp) >= startDate
  );
  
  // Generate analytics
  const analytics = {
    pixel: pixel,
    timeframe: timeframe,
    totalEvents: filteredEvents.length,
    eventsByType: {
      pageview: filteredEvents.filter(e => e.eventType === 'pageview').length,
      form_submit: filteredEvents.filter(e => e.eventType === 'form_submit').length,
      cta_click: filteredEvents.filter(e => e.eventType === 'cta_click').length,
      custom: filteredEvents.filter(e => e.eventType === 'custom').length
    },
    topPages: filteredEvents.reduce((acc, event) => {
      const url = new URL(event.url).pathname;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    topReferrers: filteredEvents.reduce((acc, event) => {
      const referrer = event.referrer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  res.json(analytics);
};

// Get pixel events
export const getPixelEvents: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  const pixel = mockPixels.find(p => p.id === id);
  if (!pixel) {
    return res.status(404).json({ error: 'Pixel not found' });
  }
  
  const pixelEvents = mockEvents
    .filter(e => e.pixelId === pixel.code)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    events: pixelEvents,
    total: mockEvents.filter(e => e.pixelId === pixel.code).length,
    limit: Number(limit),
    offset: Number(offset)
  });
};
