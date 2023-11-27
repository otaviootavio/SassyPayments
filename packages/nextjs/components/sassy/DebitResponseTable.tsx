import React from "react";
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

  const { data: getDebts } = useScaffoldContractRead({
    contractName: "SharedExpenses",
    functionName: "getDebts",
    args: [BigInt(room_id)],
  });

  const { writeAsync: distributePayments } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "distributePayments",
    args: [BigInt(room_id)],
  });

  const getDebtsData = getDebts as any;
  const parsedData = parseAnyToDebitResponse(getDebtsData);

  return (
    <div className="card w-full md:w-1/8 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Room is closed!</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Debtor</th>
                <th>Amount</th>
                <th>Creditors</th>
              </tr>
            </thead>
            <tbody>
              {parsedData?.debtors.map((debtor, index) => (
                <PayDebitRow parsedData={parsedData} index={index} key={index} debtor={debtor} />
              ))}
            </tbody>
          </table>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              distributePayments();
            }}
          >
            Distribuite payments!
          </button>
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
