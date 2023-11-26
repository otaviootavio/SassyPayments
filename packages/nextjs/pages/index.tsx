import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import CreateRoom from "~~/components/sassy/CreateRoom";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const selectedContract = "SharedExpenses";

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(selectedContract);

  if (deployedContractLoading || !deployedContractData) {
    return (
      <>
        <MetaHeader />
        <div className="flex items-center flex-col flex-grow pt-10">
          <div>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <CreateRoom />
      </div>
    </>
  );
};

export default Home;
