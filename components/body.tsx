import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { init, isAuth } from "@/lib/Web3Client";
import { useState, useEffect } from 'react';

const Body = () => {
    const [auth, setAuth] = useState('');

    useEffect(() => {
        const getAuth = async () => {
            await init();
            setAuth(await isAuth());
        };

        getAuth();

        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getAuth();
        });
    }, []);


    return (
        <>
            <Container className="p-4">
            <Row>
                <Col>RentFun MarketPlace</Col>
                <Col>Arbitrum Goerli Testnet</Col>
                <Col>
                    <Button variant="primary" onClick={init}>
                        {auth ? auth : 'Connect Wallet'}
                    </Button>
                </Col>
            </Row>
            </Container>
        </>
    )
};

export default Body;
