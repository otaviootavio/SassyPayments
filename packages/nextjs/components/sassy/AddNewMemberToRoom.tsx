import React, { useState } from "react";
import { useRouter } from "next/router";
import { AddressInput } from "../scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const AddNewMemberToRoom = () => {
  const [address, setAddress] = useState<string>("");
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "addParticipant",
    args: [BigInt(room_id), address],
  });

  return (
    <div className="card w-full md:w-1/2 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Add new participant!</h2>
        <AddressInput onChange={setAddress} value={address} placeholder="Input your address" />
        <button className="btn btn-sm btn-primary" onClick={() => writeAsync()}>
          add
        </button>
      </div>
    </div>
  );
};

export default AddNewMemberToRoom;
