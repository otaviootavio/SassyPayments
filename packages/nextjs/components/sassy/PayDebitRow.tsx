import React, { useState } from "react";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
import { formatEther } from "viem";
import { useWalletClient } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type DebitResponse = {
  debtors: string[];
  amounts: bigint[];
};

type Props = {
  debitResponse: DebitResponse;
  index: number; // Assuming index is passed to identify the specific row
};

const PayDebitRow = ({ debitResponse, index }: Props) => {
  const router = useRouter();
  const room_id = router.query.id ? router.query.id.toString() : "2";
  const { data } = useWalletClient();
  const currentAddress = data?.account?.address || "0";
  const [hasPayed, setHasPayed] = useState<boolean | null>(null);

  const { debtors, amounts } = debitResponse;
  const debtor = debtors[index];
  const amount = amounts[index];

  function absBigInt(value: bigint): bigint {
    return value < 0n ? -value : value;
  }

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "payDebt",
    args: [BigInt(room_id)],
    value: absBigInt(amount),
  });

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "hasParticipantPaid",
    args: [BigInt(room_id), debtor],
    onSuccess: async (data: any) => {
      setHasPayed(parseParticipantHasPayed(data));
    },
    onError: async e => {
      notification.error(e.message);
    },
  });

  if (!debitResponse) {
    return null; // Return null for no render if there is no debitResponse
  }

  return (
    <tr>
      <td>
        <Address size="sm" address={debtor} />
      </td>
      <td>{formatEther(amount, "wei").substring(0, 6).toString()}</td>
      <td>
        {hasPayed ? "Payed!" : "Not payed"}

        {!hasPayed && debtor === currentAddress && (
          <button onClick={() => writeAsync()} className="btn btn-sm btn-primary">
            Pay debt!
          </button>
        )}
      </td>
    </tr>
  );
};

function parseParticipantHasPayed(input: any): boolean | null {
  console.log(input);
  if (typeof input === "boolean") {
    const hasPayed = input;
    return hasPayed;
  }
  return null;
}

export default PayDebitRow;
