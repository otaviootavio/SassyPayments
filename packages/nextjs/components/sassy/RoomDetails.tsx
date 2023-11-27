/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from "react";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
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
    <>
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">My Details</h2>
          <div>
            <b>Is Participant:</b> {participantDetails[0].toString()}
          </div>
          <div>
            <b>Balance:</b> {(participantDetails[1] / BigInt(10 ** 18)).toString()} ETH
          </div>
        </div>
      </div>
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Room Details</h2>
          <div>
            <b>Owner:</b>
            <Address address={roomDetailsResponse[0].toString()} />
          </div>
          <div>
            <b>Is Open:</b> {roomDetailsResponse[1].toString()}
          </div>
          <div>
            <b>Participants:</b>
            {RoomAddresses.map((str: string, index: number) => (
              <div key={index} className="badge badge-outline mt-2">
                <Address disableAddressLink={true} format="short" address={str} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomDetails;
