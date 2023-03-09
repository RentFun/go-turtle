import {ListType, lend, rent, cancelLend, transferOut} from "@/lib/Web3Client";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function UserNftCard({ turtle, listType, cb }: { turtle: IUserNftWithMetadata, listType: string, cb: () => void}) {
    const clickFunction = () => {
        switch (listType) {
            case ListType.Mine:
                return <Button variant="primary" onClick={async (event) => {lend().then(() => {cb()})}}>Lend Out</Button>;
            case ListType.MyRental:
                return <><Card.Text>LeftSeconds: {turtle.endTime}</Card.Text><Button href='http://localhost:3001' target='_blank'>Play Game</Button></>
            case ListType.MyListed:
                return <Button variant="primary" onClick={async (event) => {cancelLend(turtle.contract_, turtle.tokenId).then(() => {cb()})}}>Delist</Button>;
            case ListType.OtherListed:
                return <Button variant="primary" onClick={async (event) => {rent().then(() => {cb()})}}>Rent</Button>;
            case ListType.OtherRental:
                return <Card.Text>LeftSeconds: {turtle.endTime}</Card.Text>
            case ListType.Delisted:
                return <Button variant="primary" onClick={async (event) => {transferOut(turtle.vault, turtle.contract_, turtle.tokenId).then(() => {cb()})}}>Transfer Out</Button>;
        }
    };

    const content = clickFunction();


    return (
        <Card style={{ width: '12rem', height: '12rem' }}>
            <Card.Img variant="top" src={turtle.metadata.image} />
            <Card.Body>
                <Card.Title>Name: {turtle.metadata.name + "-" + turtle.tokenId.toString()}</Card.Title>
                {content}
            </Card.Body>
        </Card>
    );
}

export default UserNftCard;
