import { Contract, JsonRpcSigner, Provider } from "ethers";

const CONTRACT_ADDRESS = "0x9472dA6852A73E5abf213b6C435656eD4601F85F";

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "enum SimpleVoting.Choice",
        name: "_choice",
        type: "uint8",
      },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getResults",
    outputs: [
      { internalType: "uint256", name: "yesCount", type: "uint256" },
      { internalType: "uint256", name: "noCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "votes",
    outputs: [
      {
        internalType: "enum SimpleVoting.Choice",
        name: "choice",
        type: "uint8",
      },
      { internalType: "address", name: "voter", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export function getContract(signerOrProvider: JsonRpcSigner | Provider) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}
