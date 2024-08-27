import * as Slider from "@radix-ui/react-slider";
import React, { useEffect } from "react";
import { filtersSlice } from "~/app/filters";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { throttledFilter } from "~/app/store";

const UnitsFilter = () => {
  const dispatch = useAppDispatch();
  const { active, min, max } = useAppSelector((state) => state.filters.units);

  const [value, setValue] = React.useState([0, 24]);
  const [init, setInit] = React.useState(false);
  useEffect(() => {
    setInit(true);
    if (!init) setValue([min, max]);
  }, [min, max, init]);

  return (
    <div className="mt-2 flex">
      <div>
        <input
          type="checkbox"
          className="mr-2"
          checked={active}
          onChange={(e) => {
            dispatch(filtersSlice.actions.updateUnitsActive(e.target.checked));
            throttledFilter();
          }}
        />
      </div>
      <div className="mr-6">Units</div>
      <div className="flex-1">
        <Slider.Root
          step={1}
          min={0}
          max={24}
          value={value}
          onValueChange={setValue}
          className="relative flex h-6 w-full select-none items-center"
        >
          <Slider.Track className="relative h-0.5 flex-grow outline-none bg-gray-100">
            <Slider.Range className="absolute h-full rounded-full outline-none bg-blue-500" />
          </Slider.Track>
          {[1, 2].map((i) => (
            <Slider.Thumb
              key={i}
              className="relative z-40 block h-3 w-3 cursor-pointer rounded-full font-bold shadow-xl outline-none ring-blue-200 bg-blue-600 hover:ring-4"
              onPointerUp={() => {
                dispatch(
                  filtersSlice.actions.updateUnitsRange(
                    value as [number, number]
                  )
                );
                dispatch(filtersSlice.actions.updateUnitsActive(true));
                if (active) throttledFilter();
              }}
            />
          ))}
        </Slider.Root>
      </div>
      <div className="ml-5 w-10 text-right">
        {value[0]}-{value[1]}
      </div>
    </div>
  );
};

export default UnitsFilter;
