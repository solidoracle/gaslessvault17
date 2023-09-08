import { Biconomy } from '@biconomy/mexa';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, configureChains } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

import { Button } from '../Base/Button';
import { Divider } from '../Base/Divider';
import { Toast } from '../Base/Toast';
import { Alert } from '@/components/Base/Alert';
import { useApprove } from '@/hooks/useApprove';
import { useDeposit } from '@/hooks/useDeposit';
import { useEthBalance } from '@/hooks/useEthBalance';
import { useWethBalance } from '@/hooks/useWethBalance';
import type { DataPool } from '@/services/aave/getDataPools';
import { IBSQUARE_CONTRACT_ADDRESS } from '@/utils/constants';
dotenv.config();

export type CurrencyCode = 'ETH' | 'WETH';
interface DepositProps {
  apy: DataPool['apy'];
}

let biconomy: any;

export const Deposit = ({ apy }: DepositProps) => {
  const { chains, publicClient } = configureChains(
    [mainnet, polygon],
    [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY ?? '' })],
  );
  const { approve, setApproveAmount, allowance, isApproveProcessing } = useApprove();
  const { wethBalance } = useWethBalance();
  const { ethBalance } = useEthBalance();
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const { handleDeposit, depositValue, setDepositValue, isDepositProcessing, transactionHash } = useDeposit();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('WETH');
  const noAllowanceSet = Number(ethers.formatEther(allowance)) === 0;
  const allowanceToLow = Number(depositValue) > Number(ethers.formatEther(allowance));
  const wethSelected = currencyCode === 'WETH';
  const ethSelected = currencyCode === 'ETH';
  const insufficentWeth = wethSelected && depositValue > Number(wethBalance);
  const insufficientEth = ethSelected && depositValue > Number(ethBalance);
  const insufficientFunds = insufficentWeth || insufficientEth;
  const { address } = useAccount();

  useEffect(() => {
    const initBiconomy = async () => {
      biconomy = new Biconomy(publicClient({ chainId: 5 }) as any, {
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY!,
        debug: true,
        contractAddresses: [IBSQUARE_CONTRACT_ADDRESS],
      });
      await biconomy.init();
      console.log('biconomy', biconomy);
    };
    if (address && chains && publicClient({ chainId: 5 })) initBiconomy();
  }, [address, chains, publicClient]);

  console.log('biconomy', biconomy);

  return (
    <>
      {transactionHash && <Toast transactionHash={transactionHash} timeout={5000} />}
      <>
        <form>
          <div className="mb-5 flex w-[100%] gap-4">
            <div className="w-[70%]">
              <label id="deposit-value">Deposit amount:</label>
              <input
                id="deposit-value"
                className="input mt-2"
                type="number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setDepositValue(Number(e.target.value));
                }}
              />
            </div>
            <div className="w-[30%]">
              <label className="text-text-body">Currency:</label>
              <select className="input mt-2" onChange={e => setCurrencyCode(e.target.value as CurrencyCode)}>
                {/* <option value="ETH">ETH</option> */}
                <option value="WETH">WETH</option>
              </select>
            </div>
          </div>
          <Divider className="my-6" />
          <div className="mb-10 flex flex-col justify-between gap-2 text-text-body sm:flex-row">
            <div>
              {wethSelected && <p className="data">Balance: {wethBalance} WETH</p>}
              {ethSelected && <p className="data">Balance: {ethBalance} ETH</p>}
            </div>
            <div>
              <p className="data">{apy}% APY</p>
            </div>
          </div>
          {(wethSelected && noAllowanceSet) || (wethSelected && allowanceToLow) ? (
            <Button
              type="submit"
              variant="secondary"
              className="mb-4 w-[100%]"
              onClick={e => {
                if (isSwitchOn) {
                  e.preventDefault();
                  setApproveAmount(depositValue);
                  approve(depositValue);
                } else {
                  e.preventDefault();
                  setApproveAmount(depositValue);
                  approve(depositValue);
                }
              }}
              loading={isApproveProcessing}>
              Approve
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              className="mb-4 w-[100%]"
              onClick={e => {
                if (isSwitchOn) {
                  e.preventDefault();
                  handleDeposit({ currencyCode });
                } else {
                  e.preventDefault();
                  handleDeposit({ currencyCode });
                }
              }}
              disabled={depositValue <= 0 || insufficentWeth || insufficientEth}
              loading={isDepositProcessing}>
              Deposit
            </Button>
          )}
          <div className="flex items-center">
            <p>
              No fees 🎉 - Paid for via{' '}
              <a
                href="https://www.biconomy.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="bold text-orange-500 hover:underline">
                Biconomy
              </a>
            </p>
            <label htmlFor="fees-toggle" className="ml-4 flex cursor-pointer items-center">
              <div className="relative">
                <input
                  id="fees-toggle"
                  type="checkbox"
                  className="sr-only"
                  checked={isSwitchOn}
                  onChange={() => setIsSwitchOn(prev => !prev)}
                />
                <div className={`block h-8 w-14 rounded-full ${isSwitchOn ? 'bg-orange-600' : 'bg-gray-600'}`}></div>
                <div
                  className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                    isSwitchOn ? 'translate-x-full' : ''
                  }`}></div>
              </div>
            </label>
          </div>
        </form>
      </>
      {insufficientFunds && (
        <Alert
          variant="error"
          title="Insufficient Funds"
          description="You have insufficient funds to complete this deposit. Please increase your funds or alter the deposit amount before continuing."
        />
      )}
    </>
  );
};
