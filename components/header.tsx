import Head from "next/head";;

const Header = () => {
    return (
        <Head>
            <title>RentFun</title>
            <meta charSet="utf-8"/>
            <link rel="icon" href="/logo.png"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="apple-touch-icon" href="/logo.png"/>
            <link rel="manifest" href="/manifest.json"/>
            <link rel="stylesheet" href="/font.css"/>
        </Head>
    );
};

export default Header;