import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql, ensureDatabaseSchema } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseSchema();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Необходимо войти в аккаунт' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    // Check ownership
    const existing = await sql.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updates.description || null);
    }
    if (updates.dueDate !== undefined) {
      updateFields.push(`due_date = $${paramIndex++}`);
      values.push(updates.dueDate || null);
    }
    if (updates.isCompleted !== undefined) {
      updateFields.push(`is_completed = $${paramIndex++}`);
      values.push(Boolean(updates.isCompleted));
    }
    if (updates.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex++}`);
      values.push(updates.priority);
    }
    if (updates.quadrant !== undefined) {
      updateFields.push(`quadrant = $${paramIndex++}`);
      values.push(updates.quadrant);
    }
    if (updates.estimatedMinutes !== undefined) {
      updateFields.push(`estimated_minutes = $${paramIndex++}`);
      values.push(updates.estimatedMinutes);
    }
    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.subtasks !== undefined) {
      updateFields.push(`subtasks = $${paramIndex++}`);
      values.push(JSON.stringify(updates.subtasks));
    }
    if (updates.aiScore !== undefined) {
      updateFields.push(`ai_score = $${paramIndex++}`);
      values.push(updates.aiScore);
    }
    if (updates.aiReasoning !== undefined) {
      updateFields.push(`ai_reasoning = $${paramIndex++}`);
      values.push(updates.aiReasoning);
    }

    updateFields.push(`updated_at = NOW()`);

    values.push(id, user.id);
    const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`;

    await sql.query(query, values);

    return NextResponse.json({ success: true, id, ...updates });
  } catch (error: any) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка обновления задачи' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseSchema();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Необходимо войти в аккаунт' }, { status: 401 });
    }

    const { id } = await params;
    await sql.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, user.id]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка удаления задачи' }, { status: 500 });
  }
}
