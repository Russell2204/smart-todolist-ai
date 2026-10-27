'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { EisenhowerQuadrant } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

const QUADRANTS: EisenhowerQuadrant[] = ['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'];

interface SectorMeta {
  code: string;
  label: string;
  sub: string;
  num: string;
  laserColor: string;
  laserGlow: string;
  dotColor: string;
  priorityDefault: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const SECTOR_INFO: Record<EisenhowerQuadrant, SectorMeta> = {
  DO_FIRST: {
    code: 'SECTOR A',
    label: 'ФОКУС',
    sub: 'Срочно · Важно',
    num: '01',
    laserColor: 'bg-status-danger',
    laserGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.7)]',
    dotColor: 'bg-status-danger',
    priorityDefault: 'CRITICAL',
  },
  SCHEDULE: {
    code: 'SECTOR B',
    label: 'ПЛАН',
    sub: 'Важно · Не срочно',
    num: '02',
    laserColor: 'bg-accent-amber',
    laserGlow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    dotColor: 'bg-accent-amber',
    priorityDefault: 'HIGH',
  },
  DELEGATE: {
    code: 'SECTOR C',
    label: 'ПОРУЧИТЬ',
    sub: 'Срочно · Не важно',
    num: '03',
    laserColor: 'bg-status-info',
    laserGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    dotColor: 'bg-status-info',
    priorityDefault: 'MEDIUM',
  },
  DELETE: {
    code: 'SECTOR D',
    label: 'СБРОС',
    sub: 'В архив',
    num: '04',
    laserColor: 'bg-[#585E6B]',
    laserGlow: 'shadow-none',
    dotColor: 'bg-[#585E6B]',
    priorityDefault: 'LOW',
  },
};

export function EisenhowerMatrix() {
  const { tasks, addTask, updateTask, filterStatus, searchQuery, settings } = useTaskStore();

  const [activeAddQuadrant, setActiveAddQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [selectedMobileTab, setSelectedMobileTab] = useState<EisenhowerQuadrant>('DO_FIRST');
  const [dragOverSector, setDragOverSector] = useState<EisenhowerQuadrant | null>(null);

  // Filter tasks based on global filters
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'active' && task.isCompleted) return false;
    if (filterStatus === 'completed' && !task.isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  const handleQuickAdd = async (quadrant: EisenhowerQuadrant) => {
    if (!quickTitle.trim()) return;
    const defaultPriority = SECTOR_INFO[quadrant].priorityDefault;

    if (settings.soundEnabled) playMechanicalClick(260, 0.02);
    triggerHaptic(10);

    await addTask(
      {
        title: quickTitle.trim(),
        quadrant,
        priority: defaultPriority,
        estimatedMinutes: 30,
      },
      false
    );

    setQuickTitle('');
    setActiveAddQuadrant(null);
  };

  const handleDrop = (e: React.DragEvent, targetQuadrant: EisenhowerQuadrant) => {
    e.preventDefault();
    setDragOverSector(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      if (settings.soundEnabled) playMechanicalClick(300, 0.03);
      triggerHaptic(15);
      updateTask(taskId, { quadrant: targetQuadrant });
    }
  };

  const renderSectorCard = (quadrant: EisenhowerQuadrant) => {
    const info = SECTOR_INFO[quadrant];
    const quadrantTasks = filteredTasks.filter(
      (t) => (t.quadrant || 'SCHEDULE') === quadrant
    );

    quadrantTasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return (b.aiScore || 0) - (a.aiScore || 0);
    });

    const activeCount = quadrantTasks.filter((t) => !t.isCompleted).length;
    const isDragTarget = dragOverSector === quadrant;

    return (
      <div
        key={quadrant}
        onDragOver={(e) => {
          e.preventDefault();
          if (dragOverSector !== quadrant) setDragOverSector(quadrant);
        }}
        onDragLeave={() => {
          if (dragOverSector === quadrant) setDragOverSector(null);
        }}
        onDrop={(e) => handleDrop(e, quadrant)}
        className={`relative flex flex-col rounded-[8px] border transition-all duration-150 min-h-[390px] bg-slot/85 shadow-[0_10px_30px_rgba(0,0,0,0.55)] overflow-hidden ${
          isDragTarget 
            ? 'border-accent-amber border-dashed bg-accent-amber/[0.05]' 
            : 'border-border-subtle hover:border-border-focus'
        }`}
      >
        {/* Top Laser Line (Signal Accent) */}
        <div className={`h-[2px] w-full ${info.laserColor} ${info.laserGlow}`} />

        {/* Huge Watermark Sector Number (01, 02, 03, 04) */}
        <span className="absolute top-2 right-3 font-display font-black text-6xl sm:text-7xl text-white/[0.04] select-none pointer-events-none tracking-tighter">
          {info.num}
        </span>

        {/* Sector Instrument Header */}
        <div className="relative px-3.5 py-2.5 border-b border-border-subtle bg-surface/90 flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-[2px] ${info.dotColor} ${info.laserGlow}`} />
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-white">
                  {info.code} // {info.label}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#A6AEBC]">
                {info.sub}
              </p>
            </div>
          </div>

          {/* Telemetry Counter & Quick Add Button */}
          <div className="flex items-center gap-1.5 z-10">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-[3px] bg-[#07080A] border border-[#272B35] text-[#CBD2DE] font-bold">
              [{activeCount < 10 ? `0${activeCount}` : activeCount} АКТ.]
            </span>
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                setActiveAddQuadrant(activeAddQuadrant === quadrant ? null : quadrant);
                setQuickTitle('');
              }}
              className="p-1 rounded-[3px] bg-[#07080A] hover:bg-border-subtle text-text-muted hover:text-white border border-border-subtle transition-colors"
              title="Добавить задачу прямо в этот сектор"
              aria-label="Добавить задачу"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Quick Add Slot in Sector */}
        {activeAddQuadrant === quadrant && (
          <div className="relative z-10 p-2.5 bg-surface/95 border-b border-border-subtle flex items-center gap-2">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickAdd(quadrant);
                if (e.key === 'Escape') setActiveAddQuadrant(null);
              }}
              autoFocus
              placeholder={`Новая задача для ${info.code}... [Enter]`}
              className="flex-1 px-2.5 py-1.5 rounded-[4px] bg-[#07080A] border border-border-subtle text-white placeholder:text-[#8E97A6] text-base sm:text-xs font-sans focus:outline-none focus:border-accent-amber"
            />
            <button
              type="button"
              onClick={() => handleQuickAdd(quadrant)}
              disabled={!quickTitle.trim()}
              className="px-2.5 py-1.5 rounded-[4px] bg-gradient-to-b from-[#F59E0B] to-[#D97706] hover:brightness-110 text-[#07080A] font-display font-bold text-xs uppercase disabled:opacity-40 shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
            >
              ОК
            </button>
            <button
              type="button"
              onClick={() => setActiveAddQuadrant(null)}
              className="text-[#8E97A6] hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tasks Container (with Native PC Drag & Drop) */}
        <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[500px]">
          {quadrantTasks.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center p-6 text-center">
              <span className="font-mono text-[10px] text-[#717887] uppercase tracking-widest mb-1.5">
                [ СЕКТОР СВОБОДЕН ]
              </span>
              <p className="text-xs text-[#A6AEBC] font-sans">
                Нет активных задач
              </p>
              <button
                type="button"
                onClick={() => setActiveAddQuadrant(quadrant)}
                className="mt-2 font-mono text-[11px] text-accent-amber hover:underline uppercase font-bold"
              >
                + Добавить задачу
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {quadrantTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="relative group/quad cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} compact />

                  {/* Tactile Sector Switcher Bar (Available on Mobile & PC hover) */}
                  <div className="flex sm:hidden group-hover/quad:flex items-center gap-1 mt-1 px-1.5 py-1 rounded-[3px] bg-[#07080A] border border-[#272B35] font-mono text-[10px] justify-end">
                    <span className="text-[#8E97A6] mr-1">В СЕКТОР:</span>
                    {QUADRANTS.filter((q) => q !== quadrant).map((targetQ) => (
                      <button
                        key={targetQ}
                        type="button"
                        onClick={() => {
                          if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                          triggerHaptic(8);
                          updateTask(task.id, { quadrant: targetQ });
                        }}
                        className="px-1.5 py-0.5 rounded-[2px] bg-border-subtle hover:bg-accent-amber hover:text-[#07080A] text-[#CBD2DE] font-bold transition-colors"
                        title={`Переместить в ${SECTOR_INFO[targetQ].code}`}
                      >
                        {targetQ === 'DO_FIRST' ? 'A' :
                         targetQ === 'SCHEDULE' ? 'B' :
                         targetQ === 'DELEGATE' ? 'C' : 'D'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 my-2">
      
      {/* Mobile Sector Tab Controller (< 1024px) to prevent 2000px scroll */}
      <div className="flex lg:hidden items-center gap-1 p-0.5 rounded-[6px] bg-slot border border-border-subtle shadow-sunken overflow-x-auto no-scrollbar">
        {QUADRANTS.map((quadrant) => {
          const info = SECTOR_INFO[quadrant];
          const count = filteredTasks.filter((t) => (t.quadrant || 'SCHEDULE') === quadrant && !t.isCompleted).length;
          const isSelected = selectedMobileTab === quadrant;

          return (
            <button
              key={quadrant}
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                triggerHaptic(8);
                setSelectedMobileTab(quadrant);
              }}
              className={`flex-1 py-1.5 px-2 rounded-[4px] font-mono text-[11px] whitespace-nowrap text-center transition-all ${
                isSelected
                  ? 'bg-border-subtle text-white font-bold border border-border-focus shadow-plate'
                  : 'text-[#8E97A6] hover:text-[#CBD2DE]'
              }`}
            >
              {info.code.replace('SECTOR ', '')} [{count}]
            </button>
          );
        })}
      </div>

      {/* Mobile Active Sector View (< 1024px) */}
      <div className="block lg:hidden">
        {renderSectorCard(selectedMobileTab)}
      </div>

      {/* Desktop 2x2 Sector Grid (>= 1024px) */}
      <div className="hidden lg:grid grid-cols-2 gap-5 sm:gap-6">
        {QUADRANTS.map((quadrant) => renderSectorCard(quadrant))}
      </div>

    </div>
  );
}
