import { useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import AddExpenseToRoom from "~~/components/sassy/AddExpenseToRoom";
import AddNewMemberToRoom from "~~/components/sassy/AddNewMemberToRoom";
import CloseRoom from "~~/components/sassy/CloseRoom";
import DebitResponseTable from "~~/components/sassy/DebitResponseTable";
import RoomDetails from "~~/components/sassy/RoomDetails";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

type RoomDetailResponse = {
  owner: string;
  isopen: boolean;
  participantlist: string[];
};

const TransactionPage: NextPage = () => {
  const account = useAccount();
  const accountAddress = account.address ? account.address : "0";
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";
  const [roomDetailParsed, setRoomDetailParsed] = useState<RoomDetailResponse | null>(null);

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getRoomDetails",
    args: [BigInt(room_id)],
    onSuccess: async data => {
      setRoomDetailParsed(parseRoomDetailResponse(data));
    },
  });

  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <RoomDetails />
      </div>
      {roomDetailParsed && roomDetailParsed.isopen && (
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <AddNewMemberToRoom /> <AddExpenseToRoom key={accountAddress} />
        </div>
      )}
      {roomDetailParsed && (
        <div className="flex flex-col md:flex-row gap-4 p-4">{roomDetailParsed && <CloseRoom />}</div>
      )}
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <DebitResponseTable />
      </div>
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
