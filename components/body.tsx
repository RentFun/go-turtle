import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { init, isAuth, getStore } from "@/lib/Web3Client";
import { useState, useEffect } from 'react';

const Body = () => {
    const [auth, setAuth] = useState('');
    const [hide, setHide] = useState(false);
    const [wlist, setWlist] = useState([]);

    useEffect(() => {
        const getAuth = async () => {
            await init();
            setAuth(await isAuth());
            // @ts-ignore
            setWlist(await getStore());
        };

        getAuth();
        // @ts-ignore
        if (!wlist.includes(auth)) {
            setHide(true)
        }

        //@ts-ignore
        window.ethereum.on("accountsChanged", function (accounts) {
            getAuth();
        });
    }, [auth]);


    return (
        <>
            <Container className="p-4" style={{display: hide ? 'none' : 'block' }}>
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
