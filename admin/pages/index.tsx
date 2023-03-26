import type {NextPage} from "next";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../components/admin"), {ssr: false});

const Home: NextPage = () => {
    console.log("Using old style")
    return <App/>;
};

export default Home;
