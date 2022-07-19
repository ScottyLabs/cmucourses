import type { NextPage } from "next";
import React from "react";
import { Page } from "../components/Page";
import { useRouter } from "next/router";
import { useAppDispatch } from "../app/hooks";
import { userSlice } from "../app/user";

const IndexPage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  if (router.query.q) {
    dispatch(userSlice.actions.updateSearch(router.query.q.toString()));
    void router.push("/");
  }

  return <Page sidebar={<></>} content={<></>} />;
};

export default IndexPage;
