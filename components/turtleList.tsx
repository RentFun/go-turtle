import {useCallback, useEffect, useState} from 'react';
import Card from '@/components/card';
import {
    getAliveRentals,
    getDeListed,
    getOtherListed,
    getOtherRentals,
    getUserListed,
    getUserOwnedNFTs,
    init,
    getStore,
    CurrentUser,
    TurtisAddress,
    ListType,
} from "@/lib/Web3Client";

import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from "react-bootstrap/ListGroup";

const TurtleList = () => {
    const [key, setKey] = useState(ListType.Mine.toString());
    const [mine, setMine] = useState([]);
    const [myRentals, setMyRentals] = useState([]);
    const [myListed, setMyListed] = useState([]);
    const [otherListed, setOtherListed] = useState([]);
    const [otherRentals, setOtherRentals] = useState([]);
    const [delisted, setDelisted] = useState([]);
    const [operated, setOperated] = useState(false);

    const [wlist, setWlist] = useState([]);
    const [cuser, setCuser] = useState('');

    const OperatedCB = useCallback(() => {
            setOperated(!operated);
        },
        []
    );

    useEffect(() => {
        const getWhitelist = async () => {
            await init();
            setCuser(CurrentUser());

            // @ts-ignore
            setWlist(await getStore());
        };

        getWhitelist();

        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getWhitelist();
        });
    }, []);

    useEffect(() => {
        const getNFTs = async () => {
            await init();

            switch (key) {
                case ListType.Mine:
                    // @ts-ignore
                    setMine(await getUserOwnedNFTs());
                case ListType.MyRental:
                    // @ts-ignore
                    setMyRentals(await getAliveRentals());
                case ListType.MyListed:
                    // @ts-ignore
                    setMyListed(await getUserListed(TurtisAddress));
                case ListType.OtherListed:
                    // @ts-ignore
                    setOtherListed(await getOtherListed(TurtisAddress));
                case ListType.OtherRental:
                    // @ts-ignore
                    setOtherRentals(await  getOtherRentals(TurtisAddress));
                case ListType.Delisted:
                    // @ts-ignore
                    setDelisted(await getDeListed(TurtisAddress));
            }
        };

        getNFTs();
        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getNFTs();
        });
    }, [operated, key]);

    const RowsAndCols = (cards: any[]) => {
        let allRows = [];
        let oneRow = [];
        let i = 0;
        let j = 0;
        for (; i < cards.length; i++) {
            // @ts-ignore
            oneRow.push(<Col key={i}>{cards[i]}</Col>);
            if (i > 0 && i % 4 == 0) {
                // @ts-ignore
                allRows.push(<Row key={j++}>{oneRow}</Row>);
                oneRow.length = 0;
            }
        }

        const left = cards.length % 5;
        if (left == 0) {
            return allRows;
        }
        const extra = 5 - left;
        for (let k=0; k < extra; k++) {
            // @ts-ignore
            oneRow.push(<Col key={i+k}></Col>);
        }
        // @ts-ignore
        allRows.push(<Row key={j}>{oneRow}</Row>);
        return allRows;
    };

    const addresses = wlist.map((data: string) => (
        <ListGroup.Item key={data}>{data}</ListGroup.Item>
    ));

    const myCards = mine.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.Mine} cb={OperatedCB} key={nft.tokenId.toString()}  />
    ));

    const myRentalCards = myRentals.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.MyRental} cb={OperatedCB}  key={nft.tokenId.toString()} />
    ));

    const myListedCards = myListed.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.MyListed} cb={OperatedCB} key={nft.tokenId.toString()} />
    ));

    const otherListedCards = otherListed.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.OtherListed} cb={OperatedCB} key={nft.tokenId.toString()} />
    ));

    const otherRentalsCards = otherRentals.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.OtherRental} cb={OperatedCB} key={nft.tokenId.toString()} />
    ));

    const delistedCards = delisted.map((nft: IUserNftWithMetadata) => (
        <Card turtle={nft} listType={ListType.Delisted} cb={OperatedCB} key={nft.tokenId.toString()} />
    ));

    const selectEvent = (k: string | null) => {
        if (!k) return;
        setKey(k);
    };

    // @ts-ignore
    const content = wlist.includes(cuser) ?
        <Container>
            <Tabs activeKey={key} onSelect={(k) => selectEvent(k)} id="cards" className="mb-5">
                <Tab eventKey={ListType.Mine} title={ListType.Mine}>
                    {RowsAndCols(myCards)}
                </Tab>

                <Tab eventKey={ListType.MyRental} title={ListType.MyRental}>
                    {RowsAndCols(myRentalCards)}
                </Tab>

                <Tab eventKey={ListType.MyListed} title={ListType.MyListed}>
                    {RowsAndCols(myListedCards)}
                </Tab>

                <Tab eventKey={ListType.OtherListed} title={ListType.OtherListed}>
                    {RowsAndCols(otherListedCards)}
                </Tab>

                <Tab eventKey={ListType.OtherRental} title={ListType.OtherRental}>
                    {RowsAndCols(otherRentalsCards)}
                </Tab>

                <Tab eventKey={ListType.Delisted} title={ListType.Delisted}>
                    {RowsAndCols(delistedCards)}
                </Tab>
            </Tabs>
        </Container> :
        <Container>
            <ListGroup>
                <h2>POC-Demo-Whitelist</h2>
                {addresses}
            </ListGroup>
        </Container>

    return (
        <>
            {content}
        </>
    );
};
export default TurtleList;
