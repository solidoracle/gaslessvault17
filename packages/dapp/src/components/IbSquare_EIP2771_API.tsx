import React, { useState, useEffect } from "react";
import { Button, Box, Typography, CircularProgress } from "@material-ui/core";
import { Link, Backdrop, makeStyles } from "@material-ui/core";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork, useSigner } from "wagmi";
import * as dotenv from "dotenv";
import { Biconomy } from "@biconomy/mexa";
import useGetQuoteFromNetwork from "../hooks/useGetQuoteFromNetwork";
import {
  getConfig,
  ExternalProvider,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../utils";
import useDeposit from "../hooks/useDeposit";

import {
  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
  buildForwardTxRequest,
  getBiconomyForwarderConfig,
  BuildForwardTxRequestResponse,
} from "./api-helpers/biconomyForwarderHelpers";
import { toBuffer } from "ethereumjs-util";
dotenv.config();

let biconomy: any;

function App() {
  const classes = useStyles();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  const [amount, _] = useState(ethers.BigNumber.from("1000000000000"));
  const [metaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");
  const [configUna, setConfigUna] = useState(getConfig("").configUna);
  const [configForwarder, setConfigForwarder] = useState(
    getConfig("").configForwarder
  );

  useEffect(() => {
    const confUna = getConfig(chain?.id.toString() || "").configUna;
    const configForwarder = getConfig(
      chain?.id.toString() || ""
    ).configForwarder;
    setConfigUna(confUna);
    setConfigForwarder(configForwarder);
  }, [chain?.id]);

  const { balance } = useDeposit(
    configUna.contract.address,
    configUna.contract.abi
  );

  useEffect(() => {
    const initBiconomy = async () => {
      setBackdropOpen(true);
      setLoadingMessage("Initializing Biconomy ...");
      biconomy = new Biconomy((signer?.provider as any).provider, {
        apiKey: process.env.API_KEY!,
        debug: true,
        contractAddresses: [configUna.contract.address],
      });
      await biconomy.init();
      setBackdropOpen(false);
    };
    if (address && chain && signer?.provider) initBiconomy();
  }, [address, chain, configUna, signer?.provider]);

  console.log(
    "(signer?.provider as any).provider",
    (signer?.provider as any).provider
  );

  const buildRequestAndSendApi = async (userAddress: string) => {
    try {
      const contractInstance = new ethers.Contract(
        configUna.contract.address,
        configUna.contract.abi,
        signer!
      );

      let forwarder = await getBiconomyForwarderConfig(chain!.id);

      console.log("forwarder", forwarder);

      let forwarderContract = new ethers.Contract(
        forwarder.address,
        forwarder.abi,
        signer!
      );

      const batchNonce = await forwarderContract.getNonce(userAddress, 0);

      const to = configUna.contract.address;

      let { data } = await contractInstance.populateTransaction.deposit(
        "0xccb14936c2e000ed8393a571d15a2672537838ad",
        amount
      );

      if (typeof data !== "string") {
        throw new Error("Data is undefined or not a string");
      }

      let gasLimit = await biconomy.ethersProvider.estimateGas({
        to: configUna.contract.address,
        from: address,
        data: data,
      });

      const gasLimitNum = Number(gasLimit.toNumber().toString());

      const batchId = "1240774198273";

      const request: BuildForwardTxRequestResponse =
        await buildForwardTxRequest({
          account: userAddress,
          to,
          gasLimitNum,
          batchId,
          batchNonce,
          data,
        });

      const hashToSign: string = getDataToSignForPersonalSign(request);

      // const signature = await signer!.signMessage(hashToSign);
      // console.log("signature", signature);

      signer!
        .signMessage(hashToSign)
        .then(function (sig) {
          sendApiTransaction({
            userAddress,
            request,
            sig,
            signatureType: "PERSONAL_SIGN",
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  type SendApiTransactionType = {
    userAddress: string;
    request: any;
    sig: string;
    domainSeparator?: string;
    signatureType: string;
  };

  const SIGNATURE_TYPES = {
    PERSONAL_SIGN: "PERSONAL_SIGN",
  };

  const sendApiTransaction = async ({
    userAddress,
    request,
    sig,
    domainSeparator,
    signatureType = SIGNATURE_TYPES.PERSONAL_SIGN,
  }: SendApiTransactionType) => {
    if (ethers) {
      console.log("sendApiTransaction: Detected ethers");

      let params;
      if (domainSeparator) {
        params = [request, domainSeparator, sig];
        console.log(
          "sendApiTransaction: Using domainSeparator",
          domainSeparator
        );
      } else {
        params = [request, sig];
        console.log("sendApiTransaction: Not using domainSeparator");
      }

      try {
        console.log("sendApiTransaction: About to fetch");
        fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key": process.env.API_KEY!, // solidoracle API key
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            to: configUna.contract.address,
            apiId: process.env.API_ID_DEPOSIT, // deposit IbSquare
            params: params,
            from: userAddress,
            signatureType: signatureType,
          }),
        })
          .then((response) => {
            console.log("sendApiTransaction: Fetch Response", response);
            return response.json();
          })
          .then(async function (result) {
            console.log("sendApiTransaction: Result from API", result);
            showInfoMessage(
              `Transaction sent by relayer with hash ${result.txHash}`
            );

            console.log("sendApiTransaction: Waiting for transaction receipt");
            let receipt = await getTransactionReceiptMined(result.txHash, 2000);
            console.log("sendApiTransaction: Transaction Receipt", receipt);

            setTransactionHash(result.txHash); // Ensure setTransactionHash is defined
            showSuccessMessage("Transaction confirmed on chain");
          })
          .catch(function (error) {
            console.log("sendApiTransaction: Fetch error", error);
          });
      } catch (error) {
        console.log("sendApiTransaction: Outer try-catch error", error);
      }
    } else {
      console.log("sendApiTransaction: ethers not detected");
    }
  };

  const getTransactionReceiptMined = async (
    txHash: string,
    interval?: number
  ): Promise<any> => {
    // Replace 'any' with the appropriate type
    const transactionReceiptAsync = async function (
      resolve: (value: any) => void,
      reject: (reason?: any) => void
    ) {
      // Replace 'any' with the appropriate type
      try {
        const provider = await biconomy.provider;
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt === null) {
          setTimeout(
            () => transactionReceiptAsync(resolve, reject),
            interval ?? 500
          );
        } else {
          resolve(receipt);
        }
      } catch (error) {
        reject(error);
      }
    };

    if (typeof txHash === "string") {
      return new Promise(transactionReceiptAsync);
    } else {
      throw new Error("Invalid Type: " + txHash);
    }
  };

  return (
    <div className="App">
      <section className="main">
        <div className="flex">
          <p className="mb-author">API</p>

          <p className="mb-author">
            Balance:{" "}
            {balance ? ethers.utils.formatEther(balance) : "Fetching Balance"}
          </p>
        </div>
      </section>
      <section>
        {transactionHash !== "" && (
          <Box className={classes.root} mt={2} p={2}>
            <Typography>
              Check your transaction hash
              <Link
                href={`https://kovan.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                className={classes.link}
              >
                here
              </Link>
            </Typography>
          </Box>
        )}
      </section>
      <section>
        <div className="submit-container">
          <div className="submit-row">
            <Button
              variant="contained"
              color="primary"
              onClick={() => buildRequestAndSendApi(address!)}
            >
              Deposit 0.00000001 WETH
            </Button>
          </div>
        </div>
      </section>
      <Backdrop
        className={classes.backdrop}
        open={backdropOpen}
        onClick={() => setBackdropOpen(false)}
      >
        <CircularProgress color="inherit" />
        <div style={{ paddingLeft: "10px" }}>{loadingMessage}</div>
      </Backdrop>
    </div>
  );
}

export default App;

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px",
  },
  main: {
    padding: 20,
    height: "100%",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
    opacity: ".85!important",
    background: "#000",
  },
}));
