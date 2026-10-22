import { NextRequest, NextResponse } from 'next/server';
import { testGeminiApiKey, DEFAULT_MODEL } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey || req.headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY;
    const model = body.model || DEFAULT_MODEL;

    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        hasServerKey: !!process.env.GEMINI_API_KEY,
        message: 'API-ключ не предоставлен'
      });
    }

    const testResult = await testGeminiApiKey(apiKey, model);
    return NextResponse.json({
      configured: true,
      hasServerKey: !!process.env.GEMINI_API_KEY,
      valid: testResult.success,
      message: testResult.message
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      hasServerKey: !!process.env.GEMINI_API_KEY,
      valid: false,
      message: err?.message || 'Ошибка проверки ключа'
    }, { status: 500 });
  }
}

export async function GET() {
  const hasServerKey = !!process.env.GEMINI_API_KEY;
  return NextResponse.json({
    hasServerKey,
    defaultModel: DEFAULT_MODEL
  });
}
