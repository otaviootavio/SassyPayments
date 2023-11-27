import React from "react";
import { useRouter } from "next/router";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const CloseRoom = () => {
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "closeRoom",
    args: [BigInt(room_id)],
  });

  return (
    <div className="card w-full md:w-1/8 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">End room!</h2>
        <button className="btn btn-sm btn-primary" onClick={() => writeAsync()}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CloseRoom;
