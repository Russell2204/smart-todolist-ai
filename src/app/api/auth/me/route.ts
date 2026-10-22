import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasApiKey: !!user.gemini_api_key,
        apiKey: user.gemini_api_key || '',
        geminiModel: user.gemini_model || 'gemini-2.5-flash',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error?.message }, { status: 500 });
  }
}
