import React, { useState } from "react";
import { useRouter } from "next/router";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type RoomDetailResponse = {
  owner: string;
  isopen: boolean;
  participantlist: string[];
};

function parseRoomDetailResponse(input: any): RoomDetailResponse | null {
  if (
    Array.isArray(input) &&
    input.length === 3 &&
    typeof input[0] === "string" &&
    typeof input[1] === "boolean" &&
    Array.isArray(input[2]) &&
    input[2].every(item => typeof item === "string")
  ) {
    const [owner, isopen, participantlist] = input;
    return { owner, isopen, participantlist };
  }
  return null;
}

const CloseRoom = () => {
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";
  const [roomDetailParsed, setRoomDetailParsed] = useState<RoomDetailResponse | null>(null);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "closeRoom",
    args: [BigInt(room_id)],
  });

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
    onSuccess: async (data: any) => {
      const parseRoomDetailResponse_temp = parseRoomDetailResponse(data);
      setRoomDetailParsed(parseRoomDetailResponse_temp);
      console.log(roomDetailParsed);
    },
    onError: async e => {
      notification.error(e.message);
    },
  });

  if (!roomDetailParsed)
    return (
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">Loading...</div>
      </div>
    );

  if (roomDetailParsed.isopen)
    return (
      <div className="card w-full md:w-1/8 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">End room!</h2>
          <button className="btn btn-sm btn-primary" onClick={() => writeAsync()}>
            Close
          </button>
        </div>
      </div>
    );
  else
    return (
      <div className="card w-full md:w-1/8 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">The room is closed!</h2>
        </div>
      </div>
    );
};

export default CloseRoom;
