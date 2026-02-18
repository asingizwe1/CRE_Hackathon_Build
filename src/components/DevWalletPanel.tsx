import "./DevWalletPanel.css";
import MetaMaskCard from './MetaMaskCard';
import SimpleConnectButton from './SimpleConnectButton';
import ContractInteractionSample from './ContractInteractionSample';
import logo from '../assets/logo.png';
const DevWalletPanel = () => {
    return (
        <div className="agent-panel"
        // style={{
        //     position: 'fixed',
        //     top: 80,
        //     right: 20,
        //     width: 320,
        //     background: '#0f172a',
        //     color: 'white',
        //     padding: 16,
        //     borderRadius: 10,
        //     boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        //     zIndex: 999
        // }}

        >
            <div className="agent-header">
                <div className="agent-logo"> <img src={logo} alt="LIQ logo" /> </div>

                <h3 style={{ marginTop: 0 }}>Agent Panel</h3>
            </div>
            <MetaMaskCard />

            <div style={{ marginTop: 10 }}>
                <SimpleConnectButton />
            </div>

            <div
                style={{
                    marginTop: 10,
                    padding: 7,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #111827, #1f2933)",
                    color: "#fff",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
            >
                <div style={{ fontSize: 14, opacity: 0.8 }}>
                    Exchange Rate
                </div>

                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        marginTop: 6,
                        letterSpacing: 1,
                    }}
                >
                    $1  =  UGX 3,600
                </div>

            </div>

            {/* 
            <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer' }}>
                    Contract Interaction
                </summary>
                <ContractInteractionSample />
            </details> */}
        </div>
    );
};

export default DevWalletPanel;
