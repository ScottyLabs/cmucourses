import { FCE } from "../app/types";
import { Card } from "./Card";
import React from "react";
import { FCEDetail } from "./FCEDetail";

export const FCECard = ({ fces }: { fces: FCE[] }) => {
  return (
    <Card>
      <Card.Header>FCE Browser</Card.Header>
      <FCEDetail fces={fces} />
    </Card>
  );
};
