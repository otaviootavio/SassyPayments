import type { NextPage } from "next";
import AddExpenseToRoom from "~~/components/sassy/AddExpenseToRoom";
import AddNewMemberToRoom from "~~/components/sassy/AddNewMemberToRoom";
import RoomDetails from "~~/components/sassy/RoomDetails";

const TransactionPage: NextPage = () => {
  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <RoomDetails />
      </div>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <AddNewMemberToRoom /> <AddExpenseToRoom />
      </div>
    </div>
  );
};

export default TransactionPage;
