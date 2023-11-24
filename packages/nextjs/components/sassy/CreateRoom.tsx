import React from "react";
import { displayTxResult } from "../scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const CreateRoom = () => {
  const { writeAsync: createRoomAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "createRoom",
  });

  const { data: nextRoomIdResponse } = useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "nextRoomId",
  });

  const roomId = nextRoomIdResponse as any;

  return (
    <div>
      <button className="btn btn-sm btn-primary" onClick={() => createRoomAsync?.()}>
        Create room
      </button>
      <div>Current room id: {displayTxResult(roomId)}</div>
    </div>
  );
};

export default CreateRoom;
