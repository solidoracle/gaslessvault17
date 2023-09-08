import { useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { IBSQUARE_ABI, IBSQUARE_CONTRACT_ADDRESS } from '@/utils/constants';

export const useWithdraw = () => {
  const { address } = useAccount();
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [withdrawHash, setWithdrawHash] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [balance, setBalance] = useState<bigint>();

  console.log(balance, 'balance');

  useContractRead({
    address: IBSQUARE_CONTRACT_ADDRESS,
    abi: IBSQUARE_ABI,
    functionName: 'getBalance',
    args: [address],
    watch: true,
    onSuccess(data: bigint) {
      setBalance(data);
    },
  });

  const { config: withdrawConfig } = usePrepareContractWrite({
    address: IBSQUARE_CONTRACT_ADDRESS,
    abi: IBSQUARE_ABI,
    functionName: 'withdraw',
    args: ['0xCCB14936C2E000ED8393A571D15A2672537838Ad', balance],
  });

  const { write: withdraw } = useContractWrite({
    ...withdrawConfig,
    onSuccess(data: { hash: string }) {
      setWithdrawHash(data.hash);
    },
  });

  const { isLoading: isWithdrawProcessing } = useWaitForTransaction({
    enabled: !!withdrawHash,
    hash: withdrawHash as `0x${string}`,
    onSuccess: data => setTransactionHash(data?.transactionHash),
    // TODO: onError: Show error toast message
  });

  const handleWithdraw = () => {
    console.log('beofre withdraw');
    withdraw?.();
  };

  return {
    handleWithdraw,
    withdrawValue,
    setWithdrawValue,
    isWithdrawProcessing,
    transactionHash,
    balance,
  };
};
