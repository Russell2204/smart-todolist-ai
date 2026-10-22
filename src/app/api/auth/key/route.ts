import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { testGeminiApiKey } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Необходимо авторизоваться' }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, model, validate } = body;

    const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    const selectedModel = model || user.gemini_model || 'gemini-2.5-flash';

    if (validate && trimmedKey) {
      const testResult = await testGeminiApiKey(trimmedKey, selectedModel);
      if (!testResult.success) {
        return NextResponse.json({ 
          error: `Ключ не прошел проверку: ${testResult.message}`,
          valid: false 
        }, { status: 400 });
      }
    }

    await sql.query(
      `UPDATE users 
       SET gemini_api_key = $1, gemini_model = $2, updated_at = NOW() 
       WHERE id = $3`,
      [trimmedKey || null, selectedModel, user.id]
    );

    return NextResponse.json({
      success: true,
      hasApiKey: !!trimmedKey,
      apiKey: trimmedKey,
      geminiModel: selectedModel,
      message: trimmedKey 
        ? 'Google Gemini API Key успешно сохранен в вашем аккаунте!' 
        : 'API Key удален из аккаунта.',
    });
  } catch (error: any) {
    console.error('Update API key error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка сохранения ключа' }, { status: 500 });
  }
}
