import React, { useState } from "react";
import { useRouter } from "next/router";
import PayDebitRow from "./PayDebitRow";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type DebitResponse = {
  debtors: string[];
  amounts: bigint[];
  creditors: string[][];
};

const DebitResponseTable = () => {
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "2";
  const [debitResponse, setDebitResponse] = useState<DebitResponse | null>(null);

  useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getDebts",
    args: [BigInt(room_id)],
    onSuccess: async data => {
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
          {debitResponse && debitResponse.debtors.length > 0 ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Debtor</th>
                    <th>Amount (ETH)</th>
                    <th>Creditors</th>
                  </tr>
                </thead>
                <tbody>
                  {debitResponse?.debtors.map((debtor, index) => (
                    <PayDebitRow parsedData={debitResponse} index={index} key={index} debtor={debtor} />
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            !debitResponse && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  distributePayments();
                }}
              >
                Distribuite payments!
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

function parseAnyToDebitResponse(input: any): DebitResponse | null {
  if (
    !Array.isArray(input) ||
    input.length !== 3 ||
    !Array.isArray(input[0]) ||
    !Array.isArray(input[1]) ||
    !Array.isArray(input[2])
  ) {
    return null;
  }

  const [debtors, amounts, creditors] = input;

  if (
    !debtors.every(item => typeof item === "string") ||
    !amounts.every(item => typeof item === "bigint") ||
    !creditors.every(item => Array.isArray(item) && item.every(subItem => typeof subItem === "string"))
  ) {
    return null;
  }

  return { debtors, amounts, creditors };
}

export default DebitResponseTable;
