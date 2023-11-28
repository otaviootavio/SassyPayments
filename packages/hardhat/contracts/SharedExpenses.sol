// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SharedExpenses {
	struct Participant {
		bool isParticipant;
		int256 balance;
	}

	struct Room {
		address owner;
		bool isOpen;
		mapping(address => Participant) participants;
		address[] participantList;
	}

	mapping(uint256 => Room) public rooms;
	uint256 public nextRoomId;

	event RoomCreated(uint256 roomId, address owner);
	event RoomClosed(uint256 roomId);
	event ExpenseAdded(uint256 roomId, address payer, uint256 amount);
	event BalanceSettled(uint256 roomId, address payee, uint256 amount);
	event DebtPaid(uint roomId, address payer, uint256 amount);
	event PaymentDistributed(uint roomId, address payee, uint256 payment);

	function createRoom() external {
		Room storage room = rooms[nextRoomId];
		room.owner = msg.sender;
		room.isOpen = true;
		room.participantList.push(msg.sender);
		room.participants[msg.sender] = Participant(true, 0);
		emit RoomCreated(nextRoomId, msg.sender);
		nextRoomId++;
	}

	function addParticipant(uint256 roomId, address participant) external {
		Room storage room = rooms[roomId];
		require(msg.sender == room.owner, "Only owner can add participants");
		require(room.isOpen, "Room is closed");
		require(
			!room.participants[participant].isParticipant,
			"Already a participant"
		);

		room.participants[participant] = Participant(true, 0);
		room.participantList.push(participant);
	}

	function addExpense(
		uint256 roomId,
		uint256 amount,
		address[] calldata payees
	) external {
		Room storage room = rooms[roomId];
		require(room.isOpen, "Room is closed");
		require(
			room.participants[msg.sender].isParticipant,
			"Not a participant"
		);

		uint256 share = amount / payees.length;
		for (uint i = 0; i < payees.length; i++) {
			require(
				room.participants[payees[i]].isParticipant,
				"Payee not a participant"
			);
			room.participants[payees[i]].balance -= int256(share);
		}
		room.participants[msg.sender].balance += int256(amount);

		emit ExpenseAdded(roomId, msg.sender, amount);
	}

	function closeRoom(uint256 roomId) external {
		Room storage room = rooms[roomId];
		require(msg.sender == room.owner, "Only owner can close the room");
		require(room.isOpen, "Room is already closed");

		room.isOpen = false;
		emit RoomClosed(roomId);
	}

	function payDebt(uint256 roomId) external payable {
		Room storage room = rooms[roomId];
		require(!room.isOpen, "Room is still open");
		require(
			room.participants[msg.sender].isParticipant,
			"Not a participant"
		);

		int256 participantBalance = room.participants[msg.sender].balance;
		require(participantBalance < 0, "No debt to pay");

		uint256 amountToPay = uint256(-participantBalance);
		require(msg.value == amountToPay, "Incorrect payment amount");

		// Update the participant's balance to reflect the payment
		room.participants[msg.sender].balance += int256(msg.value);

		// Optionally, you can emit an event here
		emit DebtPaid(roomId, msg.sender, msg.value);
	}

	function distributePayments(uint256 roomId) external {
		Room storage room = rooms[roomId];
		require(!room.isOpen, "Room is still open");

		// Ensure this function is called only after all debts are settled
		for (uint i = 0; i < room.participantList.length; i++) {
			require(
				room.participants[room.participantList[i]].balance >= 0,
				"Not all debts are settled"
			);
		}

		// Distribute funds to participants who are owed money
		for (uint i = 0; i < room.participantList.length; i++) {
			address payee = room.participantList[i];
			int256 payeeBalance = room.participants[payee].balance;

			if (payeeBalance > 0) {
				uint256 payment = uint256(payeeBalance);

				// Using call to send Ether
				(bool sent, ) = payable(payee).call{ value: payment }("");
				require(sent, "Failed to send Ether");

				// Update the participant's balance after payment
				room.participants[payee].balance = 0;

				// Optionally, you can emit an event here
				emit PaymentDistributed(roomId, payee, payment);
			}
		}
	}

	function getRoomDetails(
		uint256 roomId
	) external view returns (address, bool, address[] memory) {
		Room storage room = rooms[roomId];
		return (room.owner, room.isOpen, room.participantList);
	}

	function getParticipantDetails(
		uint256 roomId,
		address participant
	) external view returns (bool, int256, address[] memory) {
		Room storage room = rooms[roomId];
		require(
			room.participants[participant].isParticipant,
			"Not a participant"
		);

		Participant storage participantData = room.participants[participant];
		uint256 numParticipants = room.participantList.length;
		address[] memory relatedParticipants = new address[](numParticipants);
		uint256 counter = 0;

		if (participantData.balance < 0) {
			// For debtors: find to whom they owe money
			for (uint i = 0; i < numParticipants; i++) {
				if (room.participants[room.participantList[i]].balance > 0) {
					relatedParticipants[counter] = room.participantList[i];
					counter++;
				}
			}
		} else if (participantData.balance > 0) {
			// For creditors: find who owes them money
			for (uint i = 0; i < numParticipants; i++) {
				if (room.participants[room.participantList[i]].balance < 0) {
					relatedParticipants[counter] = room.participantList[i];
					counter++;
				}
			}
		}

		// Resize the array to fit the actual number of related participants
		assembly {
			mstore(relatedParticipants, counter)
		}

		return (
			participantData.isParticipant,
			participantData.balance,
			relatedParticipants
		);
	}

	function getDebts(
		uint256 roomId
	)
		external
		view
		returns (address[] memory, int256[] memory, address[][] memory)
	{
		Room storage room = rooms[roomId];
		require(!room.isOpen, "Room is still open");

		uint256 numParticipants = room.participantList.length;
		uint256 debtorCount = 0;

		// First pass to count the actual number of debtors
		for (uint i = 0; i < numParticipants; i++) {
			if (room.participants[room.participantList[i]].balance < 0) {
				debtorCount++;
			}
		}

		// Initialize arrays with actual size
		address[] memory debtors = new address[](debtorCount);
		int256[] memory amounts = new int256[](debtorCount);
		address[][] memory creditors = new address[][](debtorCount);

		uint256 debtorIndex = 0;
		for (uint i = 0; i < numParticipants; i++) {
			address participant = room.participantList[i];
			int256 balance = room.participants[participant].balance;

			if (balance < 0) {
				debtors[debtorIndex] = participant;
				amounts[debtorIndex] = balance;

				// Find to whom they owe money
				address[] memory owedTo = new address[](numParticipants);
				uint256 counter = 0;
				for (uint j = 0; j < numParticipants; j++) {
					if (
						room.participants[room.participantList[j]].balance > 0
					) {
						owedTo[counter] = room.participantList[j];
						counter++;
					}
				}

				// Resize the array to fit the actual number of creditors
				assembly {
					mstore(owedTo, counter)
				}
				creditors[debtorIndex] = owedTo;
				debtorIndex++;
			}
		}

		return (debtors, amounts, creditors);
	}
}
