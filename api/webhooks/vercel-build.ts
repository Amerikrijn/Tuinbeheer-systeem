import { NextRequest, NextResponse } from 'next/server';
import { BuildMonitor } from '../../scripts/build-monitor';
import crypto from 'crypto';

interface VercelWebhookPayload {
  type: string;
  id: string;
  createdAt: number;
  region?: string;
  payload: {
    team?: { id: string };
    user: { id: string };
    deployment: {
      id: string;
      meta: Record<string, any>;
      url: string;
      name: string;
    };
    links: {
      deployment: string;
      project: string;
    };
    target?: string;
    project: { id: string };
    plan: string;
    regions: string[];
  };
}

// Webhook secret for security validation
const WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET || '';

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ VERCEL_WEBHOOK_SECRET not configured - skipping signature verification');
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-vercel-signature') || '';

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhookPayload: VercelWebhookPayload = JSON.parse(body);
    
    console.log(`📡 Received webhook: ${webhookPayload.type}`);
    console.log(`🔗 Deployment: ${webhookPayload.payload.deployment.url}`);

    // Handle deployment error events
    if (webhookPayload.type === 'deployment.error') {
      console.log('🚨 Build failure detected - starting automated analysis...');
      
      const monitor = new BuildMonitor();
      
      // Run the automated fix process in the background
      monitor.monitorFromWebhook(webhookPayload).catch(error => {
        console.error('❌ Automated fix process failed:', error);
      });

      return NextResponse.json({
        message: 'Build failure detected - automated analysis started',
        deploymentId: webhookPayload.payload.deployment.id,
        timestamp: new Date().toISOString()
      });
    }

    // Handle successful deployments
    if (webhookPayload.type === 'deployment.succeeded') {
      console.log('✅ Deployment successful');
      
      return NextResponse.json({
        message: 'Deployment succeeded',
        deploymentId: webhookPayload.payload.deployment.id
      });
    }

    // Log other webhook types for monitoring
    console.log(`📋 Webhook type '${webhookPayload.type}' received but not handled`);
    
    return NextResponse.json({
      message: 'Webhook received',
      type: webhookPayload.type
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // Vercel webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    message: 'Vercel Build Monitor Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}