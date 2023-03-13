import {
    init,
    addWhitelist,
    getStore,
} from "@/lib/Web3Client";
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {ListType} from "../lib/Web3Client";
import ListGroup from 'react-bootstrap/ListGroup';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {useEffect, useState} from "react";

const Whitelist = () => {
    const [operated, setOperated] = useState(false);
    const [wlist, setWlist] = useState([]);
    useEffect(() => {
        const getWhitelists = async () => {
            await init();
            // @ts-ignore
            setWlist(await getStore());
        };

        getWhitelists();
        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getWhitelists();
        });
    }, [wlist, setOperated]);

    const addresses = wlist.map((data: string) => (
        <ListGroup.Item key={data}>{data}</ListGroup.Item>
    ));

    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log(event.target.addresses.value);
        addWhitelist(event.target.addresses.value);
        setOperated(!operated);
    };

    return (
        <>
            <Container>
                <h1>POC-Demo-Whitelist</h1>
                <ListGroup>
                    {addresses}
                </ListGroup>

                <Form onSubmit={handleSubmit} >
                    <Form.Group className="mb-3" controlId="addresses">
                        <Form.Label>Addresses</Form.Label>
                        <Form.Control type="address" placeholder="Enter addresses" />
                        <Form.Text className="text-muted">
                            User | to split multiple addresses
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" >
                        Add Operator
                    </Button>
                </Form>

            </Container>
        </>
    )
};

export default Whitelist;