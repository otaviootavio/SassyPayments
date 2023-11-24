/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const RoomDetails = () => {
  const router = useRouter();
  const accountState = useAccount();

  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { data: getRoomDetailsResponse } = useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
  });

  const { data: getParticipantDetailsResponse } = useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getParticipantDetails",
    args: [BigInt(room_id), accountState.address],
  });

  if (!getParticipantDetailsResponse || !getRoomDetailsResponse) {
    return <>Loading...</>;
  }
  const participantDetails = getParticipantDetailsResponse as any;
  const roomDetailsResponse = getRoomDetailsResponse as any;
  const RoomAddresses = roomDetailsResponse[2] as any;

  return (
    <div>
      <div>
        <b>My: isParticipant</b> = {participantDetails[0].toString()}
      </div>
      <div>
        <b>My: balance</b> = {participantDetails[1].toString()}
      </div>
      <div>
        <b>Room: owner</b> {roomDetailsResponse[0].toString()}
      </div>
      <div>
        <b>Room: is open</b> {roomDetailsResponse[1].toString()}
      </div>
      <div>
        <b>Room: participants</b>{" "}
        {RoomAddresses.map((str: string, index: number) => (
          <div key={index}>{str}</div>
        ))}
      </div>
    </div>
  );
};

export default RoomDetails;
