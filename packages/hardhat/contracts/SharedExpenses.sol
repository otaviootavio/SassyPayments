// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SharedExpenses {
	struct Participant {
		bool isParticipant;
		int256 balance;
		bool hasPaid;
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
		room.participants[msg.sender] = Participant(true, 0, true);
		emit RoomCreated(nextRoomId, msg.sender);
		nextRoomId++;
	}

	function addParticipant(uint256 roomId, address participant) external {
		Room storage room = rooms[roomId];
		require(room.isOpen, "Room is closed");
		require(
			!room.participants[participant].isParticipant,
			"Already a participant"
		);

		room.participants[participant] = Participant(true, 0, true);
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
		require(payees.length > 0, "Payees list cannot be empty");

		uint256 share = amount / payees.length;
		bool isPayerAlsoPayee = false;
		bool isPayerOnlyPayee = payees.length == 1 && payees[0] == msg.sender;

		require(!isPayerOnlyPayee, "Payer cannot be the sole payee");

		for (uint i = 0; i < payees.length; i++) {
			require(
				room.participants[payees[i]].isParticipant,
				"Payee not a participant"
			);
			if (payees[i] == msg.sender) {
				isPayerAlsoPayee = true;
			} else {
				room.participants[payees[i]].balance -= int256(share);

				if (room.participants[payees[i]].balance >= 0 ) {
					room.participants[payees[i]].hasPaid = true;
				} else {
					room.participants[payees[i]].hasPaid = false;
				}
			}
		}

		int256 netExpense = isPayerAlsoPayee
			? int256(amount - share)
			: int256(amount);
		room.participants[msg.sender].balance += netExpense;

		if (room.participants[msg.sender].balance >= 0) {
			room.participants[msg.sender].hasPaid = true;
		} else {
			room.participants[msg.sender].hasPaid = false;
		}

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
		room.participants[msg.sender].balance += int(msg.value);

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
	) external view returns (bool, int256, bool) {
		Room storage room = rooms[roomId];
		Participant storage participantData = room.participants[participant];
		return (
			participantData.isParticipant,
			participantData.balance,
			participantData.balance >= 0
		);
	}

	function hasParticipantPaid(
		uint256 roomId,
		address participant
	) external view returns (bool) {
		Room storage room = rooms[roomId];
		return room.participants[participant].balance >= 0;
	}

	function getDebts(
		uint256 roomId
	) external view returns (address[] memory, int256[] memory) {
		Room storage room = rooms[roomId];
		require(room.participantList.length > 0, "No participants in the room");

		uint256 numParticipants = room.participantList.length;

		// Initialize arrays to hold participant addresses and their balances
		address[] memory participants = new address[](numParticipants);
		int256[] memory balances = new int256[](numParticipants);

		for (uint i = 0; i < numParticipants; i++) {
			address participant = room.participantList[i];
			participants[i] = participant;
			balances[i] = room.participants[participant].balance;
		}

		return (participants, balances);
	}
}
