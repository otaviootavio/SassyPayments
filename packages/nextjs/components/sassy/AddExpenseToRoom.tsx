import React, { useState } from "react";
import { useRouter } from "next/router";
import { EtherInput } from "../scaffold-eth";
import SelectWhoHasBorrowed from "./SelectWhoHasBorrowed";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type GetRoomDetailsResponse = {
  owner: string;
  isOpen: boolean;
  participantList: string[];
};

const AddExpenseToRoom = () => {
  const account = useAccount();
  const accountAddress = account.address ? account.address : "0";

  const [ammount, setAmmount] = useState<string>("0");
  const [borrowers, setBorrowers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roomDetailsResponse, setRoomDetailsResponse] = useState<GetRoomDetailsResponse | null>(null);
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "addExpense",
    args: [BigInt(room_id), parseEther(ammount), borrowers],
  });

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
    onSuccess: async (data: any) => {
      const roomDetailsResponse_temp = parseToGetRoomDetailsResponse(data);
      if (!roomDetailsResponse_temp) return;

      roomDetailsResponse_temp.participantList = roomDetailsResponse_temp?.participantList.filter(
        item => item !== accountAddress,
      );

      setRoomDetailsResponse(roomDetailsResponse_temp);
      setIsLoading(false);
    },
  });

  return (
    <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Add people that owe you!</h2>
        <label htmlFor="borrower">
          Who has borrowed?
          <br />
          {isLoading || (
            <SelectWhoHasBorrowed
              selectedValues={borrowers}
              setSelectedValues={setBorrowers}
              options={roomDetailsResponse ? roomDetailsResponse?.participantList : [""]}
            />
          )}
        </label>
        <label htmlFor="ammount">
          Amout
          <EtherInput onChange={setAmmount} value={ammount} />
        </label>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            writeAsync();
          }}
        >
          GO!
        </button>
      </div>
    </div>
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

export default AddExpenseToRoom;
