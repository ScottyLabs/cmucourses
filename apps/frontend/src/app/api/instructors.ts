import axios from "axios";
import Fuse, { FuseIndex } from "fuse.js";

export const fetchAllInstructors = async (): Promise<{
  allInstructors: { instructor: string }[],
  fuse: Fuse<{ instructor: string }>
}> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/instructors`;

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fuseIndex: FuseIndex<{ instructor: string }> = Fuse.createIndex(["instructor"], response.data);
  const fuse = new Fuse(response.data, {}, fuseIndex);

  return { allInstructors: response.data, fuse };
};