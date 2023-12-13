import React, { useState } from "react";
import AddExpenseToRoom from "./AddExpenseToRoom";
import AddNewMemberToRoom from "./AddNewMemberToRoom";
import JoinToRoom from "./JoinToRoom";

type Props = {
  accountAddress: string;
};

const SwitchInterface: React.FC<Props> = ({ accountAddress }) => {
  const [activeComponent, setActiveComponent] = useState<string>("addMember");

  return (
    <div className="p-4">
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <a
                className={`tab tab-lg ${activeComponent === "addMember" ? "tab-active" : ""}`}
                onClick={() => setActiveComponent("addMember")}
              >
                Add Member
              </a>
              <a
                className={`tab tab-lg ${activeComponent === "joinRoom" ? "tab-active" : ""}`}
                onClick={() => setActiveComponent("joinRoom")}
              >
                Join Room
              </a>
              <a
                className={`tab tab-lg ${activeComponent === "addExpense" ? "tab-active" : ""}`}
                onClick={() => setActiveComponent("addExpense")}
              >
                Add Expense
              </a>
            </div>

            <div className="md:col-span-3">
              {activeComponent === "addMember" && <AddNewMemberToRoom />}
              {activeComponent === "joinRoom" && <JoinToRoom />}
              {activeComponent === "addExpense" && <AddExpenseToRoom key={accountAddress} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwitchInterface;
