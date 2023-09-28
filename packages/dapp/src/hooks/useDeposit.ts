import { useEffect, useState, useCallback } from "react";
import { useNetwork, useContract, useSigner, useAccount } from "wagmi";

/**
 * Fetch quote hook to be updated on connecting supported networks
 */
const useDeposit = (address: string, abi: any) => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { address: userAddress } = useAccount();

  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  // const [quote, setQuote] = useState("This is a default quote");
  // const [owner, setOwner] = useState("Default Owner Address");

  const [balance, setBalance] = useState<bigint>();

  const contract = useContract({
    addressOrName: address,
    contractInterface: abi,
    signerOrProvider: signer,
  });

  const fetchBalance = useCallback(async () => {
    try {
      setIsFetchingQuote(true);
      const res = await contract.getBalance(userAddress);
      setBalance(res);
      setIsFetchingQuote(false);
    } catch (err: any) {
      console.error(err);
      setIsFetchingQuote(false);
    }
  }, [contract, userAddress]);

  useEffect(() => {
    if (chain && !chain.unsupported && signer) fetchBalance();
  }, [chain, signer, contract, fetchBalance]);

  return { fetchBalance, balance };
};

export default useDeposit;
