import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Вы вышли из системы' });
  response.cookies.delete('token');
  return response;
}
