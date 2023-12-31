import { useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import CloseRoom from "~~/components/sassy/CloseRoom";
import DebitResponseTable from "~~/components/sassy/DebitResponseTable";
import RoomDetails from "~~/components/sassy/RoomDetails";
import SwitchInterface from "~~/components/sassy/SwitchInterface";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

type RoomDetailResponse = {
  owner: string;
  isopen: boolean;
  participantlist: string[];
};

type DebitResponse = {
  debtors: string[];
  amounts: bigint[];
};

const TransactionPage: NextPage = () => {
  const account = useAccount();
  const accountAddress = account.address ? account.address : "0";
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";
  const [roomDetailParsed, setRoomDetailParsed] = useState<RoomDetailResponse | null>(null);
  const [debitResponse, setDebitResponse] = useState<DebitResponse | null>(null);

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
    onSuccess: async data => {
      setRoomDetailParsed(parseRoomDetailResponse(data));
    },
  });

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getDebts",
    args: [BigInt(room_id)],
    onSuccess: async data => {
      setDebitResponse(parseAnyToDebitResponse(data));
    },
  });

  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <RoomDetails />
      </div>
      {roomDetailParsed && roomDetailParsed.isopen && (
        <div>
          <SwitchInterface accountAddress={accountAddress} />
        </div>
      )}
      {roomDetailParsed && (
        <div className="flex flex-col md:flex-row gap-4 p-4">{roomDetailParsed && <CloseRoom />}</div>
      )}
      {debitResponse && debitResponse.amounts.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <DebitResponseTable />
        </div>
      )}
    </div>
  );
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
export default TransactionPage;

function parseAnyToDebitResponse(input: any): DebitResponse | null {
  if (!Array.isArray(input) || input.length !== 2 || !Array.isArray(input[0]) || !Array.isArray(input[1])) {
    return null;
  }

  const [debtors, amounts] = input;

  if (!debtors.every(item => typeof item === "string") || !amounts.every(item => typeof item === "bigint")) {
    return null;
  }

  return { debtors, amounts };
}
