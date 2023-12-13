import React from "react";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const CreateRoom = () => {
  const { writeAsync: createRoomAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "createRoom",
    onSuccess: () => {
      const baseUrl = window.location.origin + window.location.pathname;
      const fullUrl = baseUrl + "rooms/" + roomId;
      window.location.href = fullUrl;
    },
  });

  const { data: nextRoomIdResponse } = useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "nextRoomId",
  });

  const roomId = nextRoomIdResponse as any;

  return (
    <div className="w-full md:w-1/2 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create room</h2>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            createRoomAsync?.();
          }}
        >
          Create room!
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
