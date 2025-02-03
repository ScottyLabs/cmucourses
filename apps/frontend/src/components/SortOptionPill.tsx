import {
  XMarkIcon,
  ArrowLongUpIcon,
  ArrowLongDownIcon,
} from "@heroicons/react/24/outline";
import { CSS } from "@dnd-kit/utilities";
import { SortOption, sortSlice, SortType } from "~/app/sorts";
import { clsx } from "clsx";
import { type MouseEventHandler } from "react";
import { type Sort } from "~/app/sorts";
import { useAppDispatch } from "~/app/hooks";
import { useSortable } from "@dnd-kit/sortable";

interface SortOptionPillProps {
  id: SortOption;
  sort: Sort;
}

export const SortOptionPill = ({ id, sort }: SortOptionPillProps) => {
  const dispatch = useAppDispatch();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleSortType: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(sortSlice.actions.toggleSortType(sort));
  };

  const removeSort: MouseEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(sortSlice.actions.removeSortByOption(sort.option));
  };

  const ArrowIcon =
    sort.type === SortType.Ascending ? ArrowLongUpIcon : ArrowLongDownIcon;

  return (
    <span
      ref={setNodeRef}
      style={style}
      onClick={toggleSortType}
      className={clsx(
        "flex items-center gap-1 rounded px-2 py-0.5 cursor-pointer",
        sort.type === SortType.Ascending
          ? "text-red-800 bg-red-50"
          : "text-teal-700 bg-teal-50"
      )}
      {...listeners}
      {...attributes}
    >
      <ArrowIcon className="size-4" />
      <span>{sort.option}</span>
      <XMarkIcon className="size-3 cursor-pointer" onClick={removeSort} />
    </span>
  );
};
