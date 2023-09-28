import { BigNumber, ethers } from "ethers";

interface HelperAttributes {
  ZERO_ADDRESS: string;
  baseURL: string;
  biconomyForwarderAbi: any[];
  biconomyForwarderDomainData: {
    salt?: string;
    verifyingContract?: string;
    name?: string;
    version?: string;
  };
  domainType: { name: string; type: string }[];
  forwardRequestType: { name: string; type: string }[];
  WETH: string;
}

interface ContractAddresses {
  biconomyForwarderAddress: string;
}

interface BiconomyForwarderConfig {
  abi: any[];
  address: string;
}

export interface BuildForwardTxRequestParams {
  account: string;
  to: string;
  gasLimitNum: number;
  batchId: string;
  batchNonce: string;
  data: string;
  deadline?: number;
}

export interface BuildForwardTxRequestResponse {
  from: string;
  to: string;
  token: string;
  txGas: number;
  tokenGasPrice: string;
  batchId: number;
  batchNonce: number;
  deadline: number;
  data: string;
}

export const helperAttributes: HelperAttributes = {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  baseURL: "https://api.biconomy.io/api/v2/meta-tx/native",
  biconomyForwarderAbi: [
    {
      inputs: [{ internalType: "address", name: "_owner", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "domainSeparator",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "domainValue",
          type: "bytes",
        },
      ],
      name: "DomainRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      inputs: [],
      name: "EIP712_DOMAIN_TYPE",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "REQUEST_TYPEHASH",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      name: "domains",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "txGas", type: "uint256" },
            { internalType: "uint256", name: "tokenGasPrice", type: "uint256" },
            { internalType: "uint256", name: "batchId", type: "uint256" },
            { internalType: "uint256", name: "batchNonce", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          internalType: "structERC20ForwardRequestTypes.ERC20ForwardRequest",
          name: "req",
          type: "tuple",
        },
        { internalType: "bytes32", name: "domainSeparator", type: "bytes32" },
        { internalType: "bytes", name: "sig", type: "bytes" },
      ],
      name: "executeEIP712",
      outputs: [
        { internalType: "bool", name: "success", type: "bool" },
        { internalType: "bytes", name: "ret", type: "bytes" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "txGas", type: "uint256" },
            { internalType: "uint256", name: "tokenGasPrice", type: "uint256" },
            { internalType: "uint256", name: "batchId", type: "uint256" },
            { internalType: "uint256", name: "batchNonce", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          internalType: "structERC20ForwardRequestTypes.ERC20ForwardRequest",
          name: "req",
          type: "tuple",
        },
        { internalType: "bytes", name: "sig", type: "bytes" },
      ],
      name: "executePersonalSign",
      outputs: [
        { internalType: "bool", name: "success", type: "bool" },
        { internalType: "bytes", name: "ret", type: "bytes" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "uint256", name: "batchId", type: "uint256" },
      ],
      name: "getNonce",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "isOwner",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "version", type: "string" },
      ],
      name: "registerDomainSeparator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "txGas", type: "uint256" },
            { internalType: "uint256", name: "tokenGasPrice", type: "uint256" },
            { internalType: "uint256", name: "batchId", type: "uint256" },
            { internalType: "uint256", name: "batchNonce", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          internalType: "structERC20ForwardRequestTypes.ERC20ForwardRequest",
          name: "req",
          type: "tuple",
        },
        { internalType: "bytes32", name: "domainSeparator", type: "bytes32" },
        { internalType: "bytes", name: "sig", type: "bytes" },
      ],
      name: "verifyEIP712",
      outputs: [],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "txGas", type: "uint256" },
            { internalType: "uint256", name: "tokenGasPrice", type: "uint256" },
            { internalType: "uint256", name: "batchId", type: "uint256" },
            { internalType: "uint256", name: "batchNonce", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          internalType: "structERC20ForwardRequestTypes.ERC20ForwardRequest",
          name: "req",
          type: "tuple",
        },
        { internalType: "bytes", name: "sig", type: "bytes" },
      ],
      name: "verifyPersonalSign",
      outputs: [],
      stateMutability: "view",
      type: "function",
    },
  ],
  biconomyForwarderDomainData: {},
  domainType: [],
  forwardRequestType: [],
  WETH: "0xCCB14936C2E000ED8393A571D15A2672537838Ad",
};

const supportedNetworks: number[] = [42, 4, 5];

const getContractAddresses = async (
  networkId: number
): Promise<ContractAddresses> => {
  let contractAddresses: ContractAddresses = { biconomyForwarderAddress: "" };
  const apiInfo = `${baseURL}/api/v2/meta-tx/systemInfo?networkId=${networkId}`;
  const response = await fetch(apiInfo);
  const systemInfo = await response.json();
  console.log("Response JSON " + JSON.stringify(systemInfo));
  contractAddresses.biconomyForwarderAddress =
    systemInfo.biconomyForwarderAddress;
  return contractAddresses;
};

const baseURL = "https://api.biconomy.io";

export const getBiconomyForwarderConfig = async (
  networkId: number
): Promise<BiconomyForwarderConfig> => {
  const contractAddresses = await getContractAddresses(networkId);
  const forwarderAddress = contractAddresses.biconomyForwarderAddress;
  return {
    abi: helperAttributes.biconomyForwarderAbi,
    address: forwarderAddress,
  };
};

export const buildForwardTxRequest = async (
  params: BuildForwardTxRequestParams
): Promise<BuildForwardTxRequestResponse> => {
  const { account, to, gasLimitNum, batchId, batchNonce, data, deadline } =
    params;
  const req = {
    from: account,
    to: to,
    token: helperAttributes.ZERO_ADDRESS,
    txGas: gasLimitNum,
    tokenGasPrice: "0",
    batchId: parseInt(batchId),
    batchNonce: parseInt(batchNonce),
    deadline: deadline || Math.floor(Date.now() / 1000 + 36000),
    data: data,
  };
  return req;
};

export const getDataToSignForEIP712 = async (
  request: any,
  networkId: number
) => {
  const contractAddresses = await getContractAddresses(networkId);
  const forwarderAddress = contractAddresses.biconomyForwarderAddress;
  let domainData = helperAttributes.biconomyForwarderDomainData;
  domainData.salt = ethers.utils.hexZeroPad(
    ethers.BigNumber.from(networkId).toHexString(),
    32
  );
  domainData.verifyingContract = forwarderAddress;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: helperAttributes.domainType,
      ERC20ForwardRequest: helperAttributes.forwardRequestType,
    },
    domain: domainData,
    primaryType: "ERC20ForwardRequest",
    message: request,
  });
  return dataToSign;
};

export const getDomainSeperator = async (networkId: number) => {
  const contractAddresses = await getContractAddresses(networkId);
  const forwarderAddress = contractAddresses.biconomyForwarderAddress;
  let domainData = helperAttributes.biconomyForwarderDomainData;
  domainData.salt = ethers.utils.hexZeroPad(
    ethers.BigNumber.from(networkId).toHexString(),
    32
  );
  domainData.verifyingContract = forwarderAddress;

  const domainSeparator = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "address", "bytes32"],
      [
        ethers.utils.id(
          "EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)"
        ),
        ethers.utils.id(domainData.name!),
        ethers.utils.id(domainData.version!),
        domainData.verifyingContract,
        domainData.salt,
      ]
    )
  );
  return domainSeparator;
};

export const getDataToSignForPersonalSign = (
  request: BuildForwardTxRequestResponse
) => {
  const hashToSign = ethers.utils.solidityKeccak256(
    [
      "address",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
    ],
    [
      request.from,
      request.to,
      request.token,
      request.txGas,
      request.tokenGasPrice,
      request.batchId,
      request.batchNonce,
      request.deadline,
      ethers.utils.keccak256(request.data),
    ]
  );
  return hashToSign;
};
