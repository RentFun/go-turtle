import {
    init,
    addOperator,
    addWhitelist,
    getStore,
} from "@/lib/Web3Client";
import Container from 'react-bootstrap/Container';
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
    }, [operated]);

    const addresses = wlist.map((data: string) => (
        <ListGroup.Item key={data}>{data}</ListGroup.Item>
    ));

    const handleAddAddresses = (event) => {
        event.preventDefault();
        addWhitelist(event.target.users.value);
        setOperated(!operated);
    };

    const handleAddOperators = (event) => {
        event.preventDefault();
        // console.log(event.target.addresses.value);
        addOperator(event.target.operators.value);
        setOperated(!operated);
    };

    return (
        <>
            <Container>
                <h1>POC-Demo-Whitelist</h1>
                <ListGroup>
                    {addresses}
                </ListGroup>

                <Form onSubmit={handleAddAddresses} >
                    <Form.Group className="mb-3" controlId="users">
                        <Form.Label>Addresses</Form.Label>
                        <Form.Control type="address" placeholder="Enter addresses" />
                        <Form.Text className="text-muted">
                            User | to split multiple addresses
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" >
                        Add Whitelist
                    </Button>
                </Form>

                <Form onSubmit={handleAddOperators} style={{display: 'none'}}>
                    <Form.Group className="mb-3" controlId="operators">
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