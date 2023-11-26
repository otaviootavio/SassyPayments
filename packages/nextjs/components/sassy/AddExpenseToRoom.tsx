import React, { useState } from "react";
import { useRouter } from "next/router";
import { AddressInput, EtherInput } from "../scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const AddExpenseToRoom = () => {
  const [ammount, setAmmount] = useState<string>("");
  const [payer, setPayer] = useState<string>("");
  const [borrower, setBorrower] = useState<string>("");

  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "addExpense",
    args: [BigInt(room_id), BigInt(ammount), [borrower]],
  });

  return (
    <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">AddExpenseToRoom</h2>
        <label htmlFor="ammount">
          Amout
          <EtherInput onChange={setAmmount} value={ammount} />
        </label>
        <br />
        <label htmlFor="payer">
          Who is paying?
          <AddressInput onChange={setPayer} value={payer} placeholder="Input your address" />
        </label>
        <br />
        <label htmlFor="borrower">
          Who has borrowed?
          <AddressInput onChange={setBorrower} value={borrower} placeholder="Input your address" />
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

export default AddExpenseToRoom;
