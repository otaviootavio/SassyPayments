import React, { useState } from "react";
import { useRouter } from "next/router";
import PayDebitRow from "./PayDebitRow";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type DebitResponse = {
  debtors: string[];
  amounts: bigint[];
};

const DebitResponseTable = () => {
  const router = useRouter();
  const room_id = router.query.id ? router.query.id.toString() : "2";
  const [debitResponse, setDebitResponse] = useState<DebitResponse | null>(null);

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getDebts",
    args: [BigInt(room_id)],
    onSuccess: data => {
      setDebitResponse(parseAnyToDebitResponse(data));
    },
  });

  const { writeAsync: distributePayments } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "distributePayments",
    args: [BigInt(room_id)],
  });

  return (
    <div className="card w-full md:w-1/8 bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="overflow-x-auto">
          {debitResponse && debitResponse.debtors.length > 0 && (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Debtor</th>
                    <th>Amount (ETH)</th>
                  </tr>
                </thead>
                <tbody>
                  {debitResponse.debtors.map((_, index) => (
                    <PayDebitRow key={index} debitResponse={debitResponse} index={index} />
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  distributePayments();
                }}
              >
                Distribute payments!
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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

export default DebitResponseTable;
