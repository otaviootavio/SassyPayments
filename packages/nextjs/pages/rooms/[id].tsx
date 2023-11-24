import type { NextPage } from "next";
import AddNewMemberToRoom from "~~/components/sassy/AddNewMemberToRoom";
import RoomDetails from "~~/components/sassy/RoomDetails";

const TransactionPage: NextPage = () => {
  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <AddNewMemberToRoom /> <RoomDetails />
    </div>
  );
};

export default TransactionPage;
