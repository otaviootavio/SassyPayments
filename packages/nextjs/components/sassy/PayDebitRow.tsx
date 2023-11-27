import React from "react";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
import { formatEther } from "viem";
import { useWalletClient } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type DebitResponse = {
  debtors: string[];
  amounts: bigint[];
  creditors: string[][];
};

type Props = {
  debtor: string;
  parsedData: DebitResponse;
  index: number;
};

const PayDebitRow = (props: Props) => {
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "2";
  const { data } = useWalletClient();
  const currentAddress = data?.account.address ? data?.account.address : "0";

  function absBigInt(value: bigint): bigint {
    return value < 0n ? -value : value;
  }

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "payDebt",
    args: [BigInt(room_id)],
    value: absBigInt(props.parsedData.amounts[props.index]),
  });

  return (
    <tr>
      <td>
        <Address size="sm" address={props.debtor} />
      </td>
      <td>{formatEther(props.parsedData.amounts[props.index], "wei").substring(0, 6)}</td>
      <td>
        {props.parsedData.creditors[props.index].map(creditor => (
          <Address key={creditor} size="sm" address={creditor} />
        ))}
      </td>
      <td>
        {props.debtor == currentAddress && (
          <button
            onClick={() => {
              writeAsync();
            }}
            className="btn btn-sm btn-primary"
          >
            Pay debt!
          </button>
        )}
      </td>
    </tr>
  );
};

export default PayDebitRow;
