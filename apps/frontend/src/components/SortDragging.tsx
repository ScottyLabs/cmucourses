import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortOptionPill } from "./SortOptionPill";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { sortSlice } from "~/app/sorts";

export const SortDragging = () => {
  const dispatch = useAppDispatch();

  const { sorts } = useAppSelector((state) => state.sorts);
  const items = sorts.map((sort) => sort.option);

  const { setNodeRef } = useDroppable({ id: "droppable" });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = sorts.findIndex((s) => s.option === active.id);
      const newIndex = sorts.findIndex((s) => s.option === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(
          sortSlice.actions.updateSorts(
            arrayMove([...sorts], oldIndex, newIndex)
          )
        );
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="rounded border border-gray-200 min-h-[calc(2rem+2px)] flex flex-wrap gap-1 p-1"
        >
          {sorts.length > 0 ? (
            sorts.map((sortItem) => (
              <SortOptionPill
                key={sortItem.option}
                id={sortItem.option}
                sort={sortItem}
              />
            ))
          ) : (
            <p className="text-gray-600 p-2">
              Select sort heuristics below, drag to reorder them, and press to
              toggle between ascending and descending.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};
