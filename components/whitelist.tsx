import {
    init,
    addOperator,
    addWhitelist,
    getStore,
    getOperatorsByType,
} from "@/lib/Web3Client";
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {useEffect, useState} from "react";

const Whitelist = () => {
    const [operated, setOperated] = useState(false);
    const [wlist, setWlist] = useState([]);
    const [olist, setOlist] = useState([]);

    useEffect(() => {
        const getOperators = async () => {
            await init();
            // @ts-ignore
            setOlist(await getOperatorsByType());
        };

        getOperators();
        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getOperators();
        });
    }, []);

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
    }, [operated]);

    const addresses = wlist.map((data: string) => (
        <ListGroup.Item key={data}>{data}</ListGroup.Item>
    ));

    const operators = olist.map((data: string) => (
        <ListGroup.Item key={data}>{data}</ListGroup.Item>
    ));

    const handleAddAddresses = (event) => {
        event.preventDefault();
        addWhitelist(event.target.users.value);
        setOperated(!operated);
    };

    const handleAddOperators = (event) => {
        event.preventDefault();
        addOperator(event.target.operators.value);
    };

    return (
        <>
            <Container>
                <ListGroup>
                    <h2>POC-Demo-Whitelist</h2>
                    {addresses}
                </ListGroup>

                <ListGroup style={{marginTop: '3rem'}}>
                    <h2 >Operators</h2>
                    {operators}
                </ListGroup>

                <Form onSubmit={handleAddAddresses} style={{marginTop: '3rem'}}>
                    <h2>Add Whitelist by Operators</h2>
                    <Form.Group className="mb-3" controlId="users">
                        <Form.Label>Addresses to add</Form.Label>
                        <Form.Control type="address" placeholder="Enter addresses" />
                        <Form.Text className="text-muted">
                            User | to split multiple addresses
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" >
                        Submit
                    </Button>
                </Form>

                <Form onSubmit={handleAddOperators} style={{display: 'none'}}>
                    <Form.Group className="mb-3" controlId="operators">
                        <Form.Label>Addresses</Form.Label>
                        <Form.Control type="address" placeholder="Enter addresses" />
                        <Form.Text className="text-muted">
                            Use | to split multiple addresses
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