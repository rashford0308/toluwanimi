"use client";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const uid = () => Math.random().toString(36).slice(2, 10);
export const withIds = <T extends object>(a: T[] = []) => a.map((x: any) => (x._id ? x : { ...x, _id: uid() }));

function Row({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="card flex gap-2">
      <button {...attributes} {...listeners} aria-label="Drag to reorder" className="touch-none cursor-grab select-none px-1 text-rose">⋮⋮</button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function SortableList<T extends { _id: string }>({ items, onChange, render }: { items: T[]; onChange: (n: T[]) => void; render: (it: T, i: number) => React.ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }));
  const end = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const a = items.findIndex((i) => i._id === e.active.id), b = items.findIndex((i) => i._id === e.over!.id);
    onChange(arrayMove(items, a, b));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">{items.map((it, i) => <Row key={it._id} id={it._id}>{render(it, i)}</Row>)}</div>
      </SortableContext>
    </DndContext>
  );
}
