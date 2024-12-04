import { Card } from "./Card";
import React from "react";

export const ReqTreeCard = () => { //add any inputs here
    return (
      <Card>
        <Card.Header>Prerequisite, Corequisite, and Postrequisite Tree</Card.Header>
      </Card>
    );
  };
  // Add the tree logic or call the tree component within the <Card> tag (look at FCECard.tsx as an example)