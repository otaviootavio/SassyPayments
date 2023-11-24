import { expect } from "chai";
import { ethers } from "hardhat";
import { SharedExpenses } from "../typechain-types";

describe("SharedExpenses", function () {
  // We define a fixture to reuse the same setup in every test.

  let sharedExpenses: SharedExpenses;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const sharedExpensesFactory = await ethers.getContractFactory("SharedExpenses");
    sharedExpenses = (await sharedExpensesFactory.connect(owner).deploy()) as SharedExpenses;
    await sharedExpenses.deployed();
  });

  describe("Run", function () {
    it("Should create a room, add payee and pizzaPayer", async function () {
      const [borrower, pizzaPayer] = await ethers.getSigners();
      const payerContractInteraction = (await sharedExpenses.connect(pizzaPayer)) as SharedExpenses;
      const borrowerContractInteraction = (await sharedExpenses.connect(borrower)) as SharedExpenses;

      const roomId = await payerContractInteraction.nextRoomId();
      await payerContractInteraction.createRoom();

      await payerContractInteraction.addParticipant(roomId, borrower.address);
      await payerContractInteraction.addExpense(roomId, BigInt(25 * 10 ** 18), [borrower.address]);
      await payerContractInteraction.closeRoom(roomId);

      await borrowerContractInteraction.payDebt(roomId, { value: BigInt(25 * 10 ** 18) });
      expect(1).to.equal(1);
    });
  });

  describe("Test Room Creation", function () {
    it("Should create a room with the correct owner and initial settings", async function () {
      const [owner] = await ethers.getSigners();
      await sharedExpenses.connect(owner).createRoom();
      const roomId = (await sharedExpenses.nextRoomId()).toNumber() - 1;

      const [roomOwner, isOpen] = await sharedExpenses.getRoomDetails(roomId);

      expect(owner.address).to.equal(roomOwner);
      expect(isOpen).to.be.true;
    });

    it("Should emit RoomCreated event on room creation", async function () {
      const [, , owner] = await ethers.getSigners();
      const roomId = await sharedExpenses.nextRoomId();
      await expect(sharedExpenses.connect(owner).createRoom())
        .to.emit(sharedExpenses, "RoomCreated")
        .withArgs(roomId, owner.address);
    });
  });

  // describe("Test Adding Participants", function () {
  //   it("Should allow the room owner to add participants", async function () {
  //     // ... setup
  //     // await sharedExpenses.connect(owner).addParticipant(roomId, participant.address);
  //     // ... assertions
  //   });

  //   it("Should not allow non-owners to add participants", async function () {
  //     // ... setup
  //     // await expect(sharedExpenses.connect(nonOwner).addParticipant(roomId, participant.address)).to.be.revertedWith("Only owner can add participants");
  //   });

  //   it("Should fail when adding an already existing participant", async function () {
  //     // ... setup
  //     // await expect(sharedExpenses.connect(owner).addParticipant(roomId, participant.address)).to.be.revertedWith("Already a participant");
  //   });
  // });

  // describe("Test Adding Expenses", function () {
  //   it("Should allow a participant to add an expense", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should correctly divide the expense among specified payees", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should fail to add an expense in a closed room", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should handle different numbers of payees and expense amounts", async function () {
  //     // ... setup and assertions
  //   });
  // });

  // describe("Test Closing a Room", function () {
  //   it("Should allow the room owner to close the room", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should fail to close an already closed room", async function () {
  //     // ... setup and assertions
  //   });
  // });

  // describe("Test Paying Debts", function () {
  //   it("Should allow participants to pay their debts", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should reject payments that don't match the exact debt amount", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should fail to pay a debt in an open room", async function () {
  //     // ... setup and assertions
  //   });
  // });

  // describe("Test Distributing Payments", function () {
  //   it("Should distribute payments only after all debts are settled", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should fail to distribute payments if there are unsettled debts", async function () {
  //     // ... setup and assertions
  //   });
  // });

  // describe("Test Query Functions", function () {
  //   it("Should return correct room details", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should return correct participant details", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should accurately reflect debts and creditors", async function () {
  //     // ... setup and assertions
  //   });
  // });

  // describe("Test Edge Cases", function () {
  //   it("Should handle expenses not evenly divisible by the number of payees", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should handle a large number of participants or expenses", async function () {
  //     // ... setup and assertions
  //   });

  //   it("Should handle minimal (zero-value) expenses", async function () {
  //     // ... setup and assertions
  //   });
  // });
});
