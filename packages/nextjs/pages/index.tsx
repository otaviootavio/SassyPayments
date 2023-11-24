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
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
          <CreateRoom />
        </div>
      </div>
    </>
  );
};

export default Home;
