import "../Navbar.css";
const sections = [
    { label: 'User', id: 'user' },
    { label: 'Deposit', id: 'deposit' },
    { label: 'Withdraw', id: 'withdraw' },
    { label: 'Loan', id: 'loan' },
    { label: 'Transactions', id: 'transactions' },
    { label: 'Protocol', id: 'protocol' }
];

const Navbar = () => {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    //701197348
    return (
        <nav className="navbar">
            <div className="brand">MIRCO-VOUCH LIQUID AGENT</div>

            <div className="nav-links">
                {sections.map(sec => (
                    <button
                        key={sec.id}
                        onClick={() => scrollTo(sec.id)}
                        className="nav-button"
                    >
                        {sec.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
