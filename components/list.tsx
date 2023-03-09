import { useState, useEffect, useCallback } from 'react';
import Card from '@/components/card';
import { init, getUserOwnedNFTs, getAliveRentals, getUserListed,
    getOtherListed, getOtherRentals, getDeListed, ListType } from "@/lib/Web3Client";
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const List = () => {
    const [mine, setMine] = useState([]);
    const [myRentals, setMyRentals] = useState([]);
    const [myListed, setMyListed] = useState([]);
    const [otherListed, setOtherListed] = useState([]);
    const [otherRentals, setOtherRentals] = useState([]);
    const [delisted, setDelisted] = useState([]);
    const [operated, setOperated] = useState(false);

    const OperatedCB = useCallback(
        async () => {
            console.log("OperatedCB");
            setOperated(!operated);
        },
        []
    );

    useEffect(() => {
        const getNFTs = async () => {
            await init();
            setMine(await getUserOwnedNFTs());
            setMyRentals(await getAliveRentals());
            setMyListed(await getUserListed());
            setOtherListed(await getOtherListed());
            setOtherRentals(await  getOtherRentals());
            setDelisted(await getDeListed());
        };

        getNFTs();
        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getNFTs();
        });
    }, [operated]);

    const RowsAndCols = (cards: any[]) => {
        let allRows = [];
        let oneRow = [];
        for (let i=0; i < cards.length; i++) {
            // @ts-ignore
            oneRow.push(<Col>{cards[i]}</Col>);
            if (i > 0 && i % 4 == 0) {
                // @ts-ignore
                allRows.push(<Row>{oneRow}</Row>);
                oneRow.length = 0;
            }
        }

        const left = cards.length % 5;
        if (left == 0) {
            return allRows;
        }
        const extra = 5 - left;
        for (let i=0; i < extra; i++) {
            // @ts-ignore
            oneRow.push(<Col></Col>);
        }
        allRows.push(<Row>{oneRow}</Row>);
        return allRows;
    };

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

    return (
        <>
            <Container>
                <Tabs defaultActiveKey={ListType.Mine} id="cards" className="mb-5">
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
            </Container>
        </>
    );
};
export default List;
