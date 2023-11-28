/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type GetParticipantDetailsResponse = {
  isParticipant: boolean;
  balance: bigint;
};

type GetRoomDetailsResponse = {
  owner: string;
  isOpen: boolean;
  participantList: string[];
};

const RoomDetails = () => {
  const router = useRouter();
  const accountState = useAccount();
  const [participantDetailResponse, setParticipantDetailResponse] = useState<GetParticipantDetailsResponse | null>(
    null,
  );
  const [roomDetailsResponse, setRoomDetailsResponse] = useState<GetRoomDetailsResponse | null>(null);

  const room_id: string = router.query.id ? router.query.id[0] : "0";

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
    onSuccess: async (data: any) => {
      const roomDetailsResponse_temp = parseToGetRoomDetailsResponse(data);
      setRoomDetailsResponse(roomDetailsResponse_temp);
    },
    onError: async e => {
      notification.error(e.message);
    },
  });

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getParticipantDetails",
    args: [BigInt(room_id), accountState.address],
    onSuccess: async (data: any) => {
      const participantDetailsResponse_temp = parseToGetParticipantDetailsResponse(data);
      setParticipantDetailResponse(participantDetailsResponse_temp);
    },
    onError: async e => {
      notification.error(e.message);
    },
  });

  if (!roomDetailsResponse || !participantDetailResponse)
    return (
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">Loading...</div>
      </div>
    );

  return (
    <>
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">My Details</h2>
          <div>
            <b>Is Participant:</b> {participantDetailResponse.isParticipant.toString()}
          </div>
          <div>
            <b>Balance:</b> {formatEther(participantDetailResponse.balance, "wei").substring(0, 6)} ETH
          </div>
        </div>
      </div>
      <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Room Details</h2>
          <div>
            <b>Owner:</b>
            <Address address={roomDetailsResponse.owner} />
          </div>
          <div>
            <b>Is Open:</b> {roomDetailsResponse.isOpen.toString()}
          </div>
          <div>
            <b>Participants:</b>
            <br />
            {roomDetailsResponse.participantList.map((str: string, index: number) => (
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

function parseToGetRoomDetailsResponse(input: any): GetRoomDetailsResponse | null {
  try {
    if (typeof input !== "object" || input === null) {
      throw new Error("Input is not an object.");
    }

    const [owner, isOpen, participantList] = input;

    if (typeof owner !== "string") {
      throw new Error("owner is not a string.");
    }

    if (typeof isOpen !== "boolean") {
      throw new Error("isOpen is not a boolean.");
    }

    if (!Array.isArray(participantList) || !participantList.every(item => typeof item === "string")) {
      throw new Error("participantList is not an array of strings.");
    }

    return { owner, isOpen, participantList };
  } catch (error) {
    console.error("Error parsing GetRoomDetailsResponse:", error);
    return null;
  }
}

function parseToGetParticipantDetailsResponse(input: any): GetParticipantDetailsResponse | null {
  try {
    if (typeof input !== "object" || input === null) {
      throw new Error("Input is not an object.");
    }

    const [isParticipant, balance] = input;

    if (typeof isParticipant !== "boolean") {
      throw new Error("isParticipant is not a boolean.");
    }

    if (typeof balance !== "bigint") {
      throw new Error("balance is not a bigint.");
    }

    return { isParticipant, balance };
  } catch (error) {
    console.error("Error parsing GetParticipantDetailsResponse:", error);
    return null;
  }
}

export default RoomDetails;
