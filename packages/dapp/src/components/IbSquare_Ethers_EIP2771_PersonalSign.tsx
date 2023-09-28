import React, { useState, useEffect } from "react";
import { Button, Box, Typography, CircularProgress } from "@material-ui/core";
import { Link, Backdrop, makeStyles } from "@material-ui/core";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork, useSigner } from "wagmi";

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
import sigUtil from "eth-sig-util";

let biconomy: any;

function App() {
  const classes = useStyles();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  const [newQuote, setNewQuote] = useState("");
  const [amount, _] = useState(ethers.BigNumber.from(100000000000000));
  const [metaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");
  const [config, setConfig] = useState(getConfig("").configEIP2771);
  const [configUna, setConfigUna] = useState(getConfig("").configUna);

  useEffect(() => {
    const conf = getConfig(chain?.id.toString() || "").configEIP2771;
    const confUna = getConfig(chain?.id.toString() || "").configUna;
    setConfig(conf);
    setConfigUna(confUna);
  }, [chain?.id]);

  const { quote, owner, fetchQuote } = useGetQuoteFromNetwork(
    config.contract.address,
    config.contract.abi
  );

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
  }, [address, chain, config, signer?.provider]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setTransactionHash("");
    if (!address) {
      showErrorMessage("Please connect wallet");
      return;
    }
    setTransactionHash("");
    if (metaTxEnabled) {
      showInfoMessage(`Getting user signature`);
      sendUnaTransaction(address);
      // sendUnaTransactionWithPrivateKey();
    } else {
      console.log("Sending normal transaction");
      // let tx = await contract.setQuote(newQuote, {
      //   from: address,
      // });
      // setTransactionHash(tx.transactionHash);
      // tx = await tx.wait(1);
      // console.log(tx);
      showSuccessMessage("Transaction confirmed");
      fetchQuote();
    }
  };

  const sendUnaTransactionWithPrivateKey = async () => {
    showInfoMessage(`Sending transaction via Private Key`);

    let privateKey = process.env.PRIVATE_KEY!;
    let wallet = new ethers.Wallet(privateKey);
    const provider = await biconomy.provider;

    const contractInstance = new ethers.Contract(
      configUna.contract.address,
      configUna.contract.abi,
      biconomy.ethersProvider
    );

    let { data } = await contractInstance.populateTransaction.deposit(
      "0xCCB14936C2E000ED8393A571D15A2672537838Ad",
      amount
    );

    // let gasPrice = await provider.getGasPrice();
    // let gasLimit = await provider.estimateGas({
    //   to: config.contract.address,
    //   from: wallet.address,
    //   data: data,
    // });

    let rawTx = {
      to: configUna.contract.address,
      data: data,
      from: wallet.address,
      value: "0x0",
      //gasLimit: web3.utils.toHex(gasLimit),
    };

    let signedTx = await wallet.signTransaction(rawTx);

    const forwardRequestData = await biconomy.getForwardRequestAndMessageToSign(
      signedTx,
      configUna.contract.address // usdc??
    );

    const signature = sigUtil.signTypedMessage(
      Buffer.from(privateKey, "hex"),
      {
        data: forwardRequestData.personalFormat, // option to get personalFormat also
      },
      "V4"
    );

    let dataTx = {
      signature: signature,
      forwardRequest: forwardRequestData.request,
      rawTransaction: signedTx,
      signatureType: biconomy.PERSONAL_SIGN,
    };

    let tx = await provider.send("eth_sendRawTransaction", [dataTx]);
    console.log(tx);
    biconomy.on("txHashGenerated", (data: any) => {
      console.log(data);
      showSuccessMessage(`tx hash ${data.hash}`);
    });
    biconomy.on("txMined", (data: any) => {
      console.log(data);
      showSuccessMessage(`tx mined ${data.hash}`);
      fetchQuote();
    });
  };

  const sendUnaTransaction = async (userAddress: string) => {
    try {
      showInfoMessage(`Sending transaction via Biconomy`);
      const provider = await biconomy.provider;

      const contractInstance = new ethers.Contract(
        configUna.contract.address,
        configUna.contract.abi,
        biconomy.ethersProvider
      );

      let { data } = await contractInstance.populateTransaction.deposit(
        "0xCCB14936C2E000ED8393A571D15A2672537838Ad",
        amount
      );

      let txParams = {
        data: data,
        to: configUna.contract.address,
        from: userAddress,
        signatureType: "PERSONAL_SIGN",
      };
      console.log("txParams", txParams);
      const tx = await provider.send("eth_sendTransaction", [txParams]);
      console.log(tx);
      biconomy.on("txHashGenerated", (data: any) => {
        console.log(data);
        showSuccessMessage(`tx hash ${data.hash}`);
      });
      biconomy.on("txMined", (data: any) => {
        console.log(data);
        showSuccessMessage(`tx mined ${data.hash}`);
        fetchQuote();
      });
    } catch (error) {
      fetchQuote();
      console.log(error);
    }
  };

  return (
    <div className="App">
      <section className="main">
        <div className="flex">
          <p className="mb-author">IbSquare</p>

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
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Deposit 0.00000001 WETH
            </Button>
            {/* <Button
              variant="contained"
              color="primary"
              onClick={onSubmitWithPrivateKey}
              style={{ marginLeft: "10px" }}
            >
              Submit (using private key)
            </Button> */}
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
