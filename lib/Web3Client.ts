import { ethers } from "ethers";
import RentFunData from "../deployments/ArbitrumGoerli/RentFun.json"; // get RentFunABI data
import TurtisData from "../deployments/ArbitrumGoerli/Turtis.json"; // get Turtis data
import OwnerVaultData from "../deployments/ArbitrumGoerli/OwnerVault.json"; // get Turtis data

const RentFunAddress = RentFunData.address;
const RentFunABI = RentFunData.abi;
const OwnerVaultABI = OwnerVaultData.abi;

export const TurtisAddress = TurtisData.address;
const TurtisABI = TurtisData.abi;

let rentFunContract: ethers.Contract;
let turtisContract: ethers.Contract;
let provider: ethers.providers.Web3Provider;
let currentUser: string;

export const FileHead = "ipfs://";
export const dedicatedGateway = process.env.NEXT_PUBLIC_DEDICATED_GATEWAY as string;

/**
 * * for init web3 metamasek
 * @returns true
 */
export const init = async () => {
    //@ts-ignore
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (oldNetwork) => {
        // console.log(oldNetwork.chainId);
        if (oldNetwork.chainId != 421613) {
            //@ts-ignore
            window.ethereum
                .request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: "0x66eed",
                            chainName: "Arbitrum Goerli Testnet",
                            nativeCurrency: {
                                name: "Goerli ETH",
                                symbol: "ETH",
                                decimals: 18,
                            },
                            rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
                            blockExplorerUrls: ["https://goerli.arbiscan.io/"],
                        },
                    ],
                })
                .catch((error: any) => {
                    console.log(error);
                });
            return false;
        }
    });
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    currentUser = await signer.getAddress();
    rentFunContract = new ethers.Contract(RentFunAddress, RentFunABI, signer);
    turtisContract = new ethers.Contract(TurtisAddress, TurtisABI, signer);
    return true;
};

export const isAuth = async () => {
    let address: string;
    const signer = provider?.getSigner();
    address = await signer?.getAddress();
    return address;
};

export const getUserOwnedNFTs = () => {
    return new Promise(function (res, rej) {
        try {
            turtisContract.getUserOwnedNFTs(currentUser).then(async function (datas: any) {
                res(await getMetadatas(ListType.Mine, datas));
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const getAliveRentals = async () => {
    return new Promise(function (res, rej) {
        try {
            rentFunContract.getAliveRentals(currentUser, TurtisAddress).then(async function (tokens: any) {
                res(await getMetadatas(ListType.MyRental, tokens));
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const getUserListed = async (contract: string) => {
    let tds = await getAllTokenDetails(contract);
    tds = tds.filter(td => td.depositor === currentUser && (td.rentStatus == 1 || td.rentStatus == 2));
    return await getMetadatas(ListType.MyListed, tds);
};

export const getOtherListed = async (contract: string) => {
    let tds = await getAllTokenDetails(contract);
    tds = tds.filter(td => td.depositor !== currentUser && (td.rentStatus == 1 || td.rentStatus == 2));
    return await getMetadatas(ListType.OtherListed, tds);
};

export const getOtherRentals = async (contract: string) => {
    let rentals = await getOtherRentalsFromRentFun(contract);
    rentals = rentals.filter(r => r.renter !== currentUser &&  r.endTime >= TimeAsSeconds());
    return await getMetadatas(ListType.OtherRental, rentals);
};

export const getDeListed = async (contract: string) => {
    let tds = await getAllTokenDetails(contract);
    tds = tds.filter( td => td.rentStatus == 3 &&
        td.endTime < TimeAsSeconds());

    let details: TokenDetail[] = [];
    for (let i=0; i < tds.length; i++) {
        if (!tds[i].tokenId || tds[i].rentStatus != 3) {
            continue
        }

        let owner = await tokenOwner(tds[i].tokenId);
        if (owner == tds[i].vault) {
            details.push(tds[i]);
        }
    }

    return await getMetadatas(ListType.Delisted, details);
};

export const getAllTokenDetails = async (contract: string) => {
    const nextTokenIdx = await getNextTokenIdx();

    let details: TokenDetail[] = [];
    if (!nextTokenIdx || nextTokenIdx == 0) {
        return details;
    }

    for(let i=1; i < nextTokenIdx; i++) {
        let td = await getTokenDetails(i);

        if (!td) {
            console.log("getTokenDetails error");
            continue
        }

        // @ts-ignore
        if (td.contract_ === contract) {
            details.push(td as TokenDetail);
        }
    }

    return details;
};

export const getOtherRentalsFromRentFun = async (contract: string) => {
    const totalRentalCount = await getTotalRentCount();

    let rentals: Rental[] = [];
    if (!totalRentalCount || totalRentalCount == 0) {
        return rentals;
    }

    for(let i=1; i <= totalRentalCount; i++) {
        let rental = await getRentalByIndex(i);

        // @ts-ignore
        if (!rental) {
            console.log("getOtherRentalsFromRentFun error");
            continue
        }

        // @ts-ignore
        if (rental.contract_ === contract) {
            rentals.push(rental as Rental);
        }
    }

    return rentals;
};

export const getMetadatas = async (listType: ListType, tokens: any) => {
    return new Promise(async function (res) {
        try {
            const datas = tokens.map(async (item: any) => {
                let tokenURI = await getTokenUrlById(item.tokenId);

                // @ts-ignore
                tokenURI = tokenURI.replace(FileHead, dedicatedGateway);
                let metadata = await (
                    // @ts-ignore
                    await fetch(tokenURI)
                ).json();
                metadata.image = metadata.image.replace(FileHead, dedicatedGateway);


                let endTime = item.endTime - TimeAsSeconds();
                if (endTime < 0) {
                    endTime = 0;
                }
                const result = {...item, tokenURI: tokenURI, metadata: metadata, endTime: endTime};
                return result;
            });

            const numFruits = await Promise.all(datas);
            res(await numFruits);
        } catch (error) {
            console.log(error);
        }
    });
};

export const getNextTokenIdx  = () => {
    return new Promise(function (res) {
        rentFunContract.nextTokenIdx().then(async function (data: any) {
            res(await data);
        });
    });
};

export const getTokenDetails  = (index: number) => {
    return new Promise(function (res) {
        rentFunContract.tokenDetails(index).then(async function (data: any) {
            res(await data);
        });
    });
};

export const getTotalRentCount  = () => {
    return new Promise(function (res) {
        rentFunContract.totalRentCount().then(async function (data: any) {
            res(await data);
        });
    });
};

export const getRentalByIndex  = (index: number) => {
    return new Promise(function (res) {
        rentFunContract.rentals(index).then(async function (data: any) {
            res(await data);
        });
    });
};


export const getTokenUrlById = async (tokenId: number) => {
    return new Promise(function (res) {
        try {
            turtisContract.tokenURI(tokenId).then(async function (data: any) {
                res(data);
            });
        } catch (error) {
            console.log("gettokenURIError", error);
        }
    });
};

export const transferOut = async (vault: string, contract_: string, tokenId: number) => {
    const signer = provider.getSigner();
    let ownerVaultContract = new ethers.Contract(vault, OwnerVaultABI, signer);

    return new Promise(function (res) {
        try {
            ownerVaultContract.transferNFT(contract_, tokenId, currentUser, overrides).then(async function (data: any) {
                res(data);
            });
        } catch (error) {
            console.log("transferOutError", error);
        }
    });
};

export const setUnitTime = async () => {
    return new Promise(function (res, rej) {
        try {
            rentFunContract.setUnitTime(3600, overrides).then(async function (transaction: any) {
                console.log("initialize transaction", transaction);
                let transactionReceipt = null;
                while (transactionReceipt == null) {
                    // Waiting expectedBlockTime until the transaction is mined
                    // @ts-ignore
                    transactionReceipt = await provider.getTransactionReceipt(
                        transaction.hash
                    );
                    await sleep(1000);
                }
                res(transaction);
            });
        } catch (error) {
            console.log("setUnitTimeError", error);
        }
    });
};

export const approve = async (tokenId: number) => {
    return new Promise(function (res, rej) {
        try {
            turtisContract.approve(RentFunAddress, tokenId, overrides).then(async function (transaction: any) {
                let transactionReceipt = null;
                while (transactionReceipt == null) {
                    // Waiting expectedBlockTime until the transaction is mined
                    // @ts-ignore
                    transactionReceipt = await provider.getTransactionReceipt(
                        transaction.hash
                    );
                    await sleep(1000);
                }
                res(transaction);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const lend = async (contract_: string, tokenId: number, payment: string, unitFee: number) => {
    const approved = await IsApproved(tokenId, RentFunAddress);
    // @ts-ignore
    if (!approved) {
        await approve(tokenId);
    }

    return new Promise(function (res, rej) {
        try {
            rentFunContract.lend(TurtisAddress, tokenId,  payment, unitFee, overrides).then(async function (transaction: any) {
                let transactionReceipt = null;
                while (transactionReceipt == null) {
                    // Waiting expectedBlockTime until the transaction is mined
                    // @ts-ignore
                    transactionReceipt = await provider.getTransactionReceipt(
                        transaction.hash
                    );
                    await sleep(1000);
                }
                res(transaction);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const rent = async (contract_: string, tokenId: number, amount: number) => {
    return new Promise(function (res, rej) {
        try {
            // @ts-ignore
            rentFunContract.rent(contract_, tokenId, amount, {...overrides, value: amount*ethers.BigNumber.from(1e15)}).then(async function (transaction: any) {
                let transactionReceipt = null;
                while (transactionReceipt == null) {
                    // Waiting expectedBlockTime until the transaction is mined
                    // @ts-ignore
                    transactionReceipt = await provider.getTransactionReceipt(
                        transaction.hash
                    );
                    await sleep(1000);
                }
                res(transaction);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const cancelLend = async (contract_: string, tokenId: number) => {
    return new Promise(function (res, rej) {
        try {
            rentFunContract.cancelLend(TurtisAddress, tokenId, overrides).then(async function (transaction: any) {
                let transactionReceipt = null;
                while (transactionReceipt == null) {
                    // Waiting expectedBlockTime until the transaction is mined
                    // @ts-ignore
                    transactionReceipt = await provider.getTransactionReceipt(
                        transaction.hash
                    );
                    await sleep(1000);
                }
                res(transaction);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const IsApproved = async (tokenId: number, operator: string) => {
    getApproved(tokenId).then((res) => {
        return res === operator;
    });
};

export const getApproved = async (tokenId: number) => {
    return new Promise(function (res) {
        try {
            turtisContract.getApproved(tokenId).then(async function (data: any) {
                res(data);
            });
        } catch (error) {
            console.log("isApprovedForAllError", error);
        }
    });
};

export const isApprovedForAll = async (owner: string, operator: string) => {
    return new Promise(function (res) {
        try {
            turtisContract.isApprovedForAll(owner, operator).then(async function (data: any) {
                res(data);
            });
        } catch (error) {
            console.log("isApprovedForAllError", error);
        }
    });
};

export const tokenOwner = async (tokenId: number) => {
    return new Promise(function (res) {
        try {
            turtisContract.ownerOf(tokenId).then(async function (data: any) {
                res(data);
            });
        } catch (error) {
            console.log("tokenOwnerError", error);
        }
    });
};

const sleep = (milliseconds: number | undefined) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const overrides = {
    gasLimit: 4300000,
    gasPrice: ethers.utils.parseUnits('7', 'gwei'),
};

export enum ListType {
    Mine = "Mine",
    MyRental = "My Rentals",
    MyListed = "My Listed",
    OtherListed = "Other Listed",
    OtherRental = "Other Rentals",
    Delisted = "Delisted",
}

const TimeAsSeconds = () => {
    return Math.floor(Date.now() / 1000)
};

export const zeroAddress = '0x0000000000000000000000000000000000000000';
