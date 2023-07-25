// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EchoContract {
    // Define an event that will be emitted when the current block number is requested
    event EmitRequested(address requester);

    function getCurrentBlockNumber() public view returns (uint256) {
        // return current block number
        return block.number;
    }

  function emitEvent() public {
    emit EmitRequested(msg.sender);
  }
}
