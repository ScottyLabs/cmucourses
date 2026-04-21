import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { finalsSlice } from "~/app/finals";

export default function FinalsSearch() {
    const dispatch = useAppDispatch();
    const numResults = useAppSelector((state) => state.finals.numResults);
    const initialSearch = useAppSelector((state) => state.finals.search);
    const [search, setSearch] = useState(initialSearch);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        dispatch(finalsSlice.actions.updateSearch(e.target.value));
    };

    useEffect(() => {
        setSearch(initialSearch);
    }, [initialSearch]);

    return (
        <>
            <div className="relative flex border-b border-b-gray-500 text-gray-500 ">
                <span className="absolute inset-y-0 left-0 flex items-center">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
                <input
                    autoFocus
                    className="flex-1 py-2 pl-7 text-xl placeholder-gray-300 bg-transparent focus:outline-none"
                    type="search"
                    value={search}
                    onChange={onChange}
                    placeholder="Filter by course..."
                />
            </div>
            <div className="flex justify-between">
                <div className="mt-3 text-sm text-gray-400">
                    {
                        numResults + " results"
                    }
                </div>
            </div>
        </>
    );
};

