import React from "react";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const JoinToRoom = () => {
  const account = useAccount();
  const router = useRouter();
  const room_id: string = router.query.id ? router.query.id[0] : "0";

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "SharedExpenses",
    functionName: "addParticipant",
    args: [BigInt(room_id), account.address],
  });

  return (
    <>
      <h2 className="card-title">Join to the room!</h2>
      Current address: <br />
      <Address address={account.address} hasCopyIcon={false} format="short" />
      <button className="btn btn-sm btn-primary" onClick={() => writeAsync()}>
        Im in it!
      </button>
    </>
  );
};

export default JoinToRoom;
