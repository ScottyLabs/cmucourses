import axios from "axios";
import { Gened } from "~/app/types";
import { GetToken } from "@clerk/types";

export const fetchGenedsBySchool = async (selectedSchool: string, isSignedIn: boolean | undefined, getToken: GetToken): Promise<Gened[]> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/geneds`;

  const params = new URLSearchParams();
  params.append("school", selectedSchool);

  const token = await getToken();

  if (isSignedIn && token) {
    const response = await axios.post(url, { token }, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data;
  } else {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data;
  }
};