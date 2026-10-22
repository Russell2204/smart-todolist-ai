import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types/task';
import { quickAddWithAI } from '@/lib/gemini';

// In-memory fallback task store for server-side persistence
let serverTasks: Task[] = [];

export async function GET() {
  return NextResponse.json({ tasks: serverTasks });
}

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const body = await req.json();
    const { title, description, dueDate, priority, quadrant, estimatedMinutes, tags, autoAnalyze } = body;

    let finalTaskData: Partial<Task> = {
      title,
      description,
      dueDate,
      priority: priority || 'MEDIUM',
      quadrant: quadrant || 'SCHEDULE',
      estimatedMinutes: estimatedMinutes || 30,
      tags: tags || [],
    };

    if (autoAnalyze && title) {
      try {
        const aiData = await quickAddWithAI(title, customApiKey);
        finalTaskData = {
          ...finalTaskData,
          title: aiData.title || title,
          description: aiData.description || description,
          dueDate: aiData.dueDate || dueDate,
          priority: aiData.priority || priority || 'MEDIUM',
          quadrant: aiData.quadrant || quadrant || 'SCHEDULE',
          estimatedMinutes: aiData.estimatedMinutes || estimatedMinutes || 30,
          tags: aiData.tags && aiData.tags.length > 0 ? aiData.tags : (tags || []),
          aiScore: aiData.aiScore,
          aiReasoning: aiData.aiReasoning,
        };
      } catch (e) {
        console.warn('AutoAnalyze during POST /api/tasks failed:', e);
      }
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: finalTaskData.title || 'Новая задача',
      description: finalTaskData.description,
      createdAt: new Date().toISOString(),
      dueDate: finalTaskData.dueDate,
      isCompleted: false,
      priority: finalTaskData.priority || 'MEDIUM',
      quadrant: finalTaskData.quadrant || 'SCHEDULE',
      estimatedMinutes: finalTaskData.estimatedMinutes,
      tags: finalTaskData.tags || [],
      subtasks: [],
      aiScore: finalTaskData.aiScore,
      aiReasoning: finalTaskData.aiReasoning,
    };

    serverTasks.unshift(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ошибка создания задачи' }, { status: 500 });
  }
}
