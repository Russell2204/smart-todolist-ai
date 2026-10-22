import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    return NextResponse.json({ id, ...updates, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ошибка обновления задачи' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ошибка удаления задачи' }, { status: 500 });
  }
}
