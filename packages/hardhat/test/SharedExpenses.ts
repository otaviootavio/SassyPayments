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

  describe("Debt Management", function () {
    it("Should correctly report debts and creditors after expenses are added", async function () {
      const [, borrower, pizzaPayer] = await ethers.getSigners();

      // Create a room and add participants
      await sharedExpenses.connect(pizzaPayer).createRoom();
      const roomId = (await sharedExpenses.nextRoomId()).toNumber() - 1;
      await sharedExpenses.connect(pizzaPayer).addParticipant(roomId, borrower.address);

      // Add an expense
      await sharedExpenses.connect(pizzaPayer).addExpense(roomId, ethers.utils.parseEther("1"), [borrower.address]);

      // Close the room and check debts
      await sharedExpenses.connect(pizzaPayer).closeRoom(roomId);
      const [debtors, amounts, creditors] = await sharedExpenses.getDebts(roomId);

      expect(debtors).to.include(borrower.address);
      expect(amounts[0].abs()).to.equal(ethers.utils.parseEther("1"));
      expect(creditors[0]).to.include(pizzaPayer.address);
    });

    it("Should return empty arrays if no debts are present", async function () {
      const [, newParticipant] = await ethers.getSigners();

      // Create a new room with no expenses
      await sharedExpenses.connect(newParticipant).createRoom();
      const roomId = (await sharedExpenses.nextRoomId()).toNumber() - 1;

      // Close the room and check debts
      await sharedExpenses.connect(newParticipant).closeRoom(roomId);
      const [debtors, amounts, creditors] = await sharedExpenses.getDebts(roomId);

      expect(debtors).to.be.empty;
      expect(amounts).to.be.empty;
      expect(creditors).to.be.empty;
    });
  });

  describe("Participant Details", function () {
    it("Should correctly return participant details", async function () {
      const [, borrower, pizzaPayer] = await ethers.getSigners();

      // Create a room and add participants
      await sharedExpenses.connect(pizzaPayer).createRoom();
      const roomId = (await sharedExpenses.nextRoomId()).toNumber() - 1;
      await sharedExpenses.connect(pizzaPayer).addParticipant(roomId, borrower.address);

      // Check participant details
      const [isParticipant, balance] = await sharedExpenses.getParticipantDetails(roomId, borrower.address);

      expect(isParticipant).to.be.true;
      expect(balance).to.equal(0);
    });
  });

  describe("Debt Retrieval", function () {
    it("Should accurately report debts and creditors", async function () {
      const [owner, participant1, participant2] = await ethers.getSigners();

      // Owner creates a room
      await sharedExpenses.connect(owner).createRoom();
      const roomId = (await sharedExpenses.nextRoomId()).toNumber() - 1;

      // Add participants to the room
      await sharedExpenses.connect(owner).addParticipant(roomId, participant1.address);
      await sharedExpenses.connect(owner).addParticipant(roomId, participant2.address);

      // Participant1 incurs an expense paid by Participant2
      const expenseAmount = ethers.utils.parseEther("2"); // 2 ETH
      await sharedExpenses.connect(participant2).addExpense(roomId, expenseAmount, [participant1.address]);

      // Close the room
      await sharedExpenses.connect(owner).closeRoom(roomId);

      // Retrieve debts
      const [debtors, amounts, creditors] = await sharedExpenses.getDebts(roomId);

      // Assertions
      expect(debtors).to.have.lengthOf(1);
      expect(debtors[0]).to.equal(participant1.address);
      expect(amounts[0]).to.equal(expenseAmount.mul(BigInt(-1)));
      expect(creditors[0]).to.have.lengthOf(1);
      expect(creditors[0][0]).to.equal(participant2.address);
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
