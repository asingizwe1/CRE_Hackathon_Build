// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";


/**       ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
 * @title CoreMicroBank
 * @author Louis Asingizwe
 * @notice Custodial microbanking core with deposits, fees, loans, and yield
 * @dev Hackathon-grade, event-heavy, demo-friendly architecture
 */

    /*//////////////////////////////////////////////////////////////
                               INTERFACES
    //////////////////////////////////////////////////////////////*/
interface IMockLiquid {
    function mint(address to, uint256 amount) external;
}


//AutomationCompatibleInterface-> Automation, your contract MUST have these functions
contract CoreMicroBank is AutomationCompatible{

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/
uint256 public lastGlobalInterestRun;
uint256 public constant INTEREST_INTERVAL = 5 seconds;
///interest constants above
    uint256 public constant FEE_BPS = 500; // 5%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant BORROW_LIMIT_BPS = 5_000; // 50%
    uint256 public constant ANNUAL_INTEREST_BPS = 1_000; // 10% APR
AggregatorV3Interface public ugxUsdFeed;//store oracle address
IMockLiquid public liquidToken;
uint256 public constant WITHDRAW_BONUS_BPS = 200; // 2%

/*//////////////////////////////////////////////////////////////
                  DEMO: ACTIVE BORROWER 
//////////////////////////////////////////////////////////////*/

bytes32 public demoActiveBorrowerId;

event DemoActiveBorrowerUpdated(bytes32 indexed userId, uint256 timestamp);//Emits event when active borrower changes.
//Makes interest borrower-specific (not global).
//Stores one borrower who gets automated interest updates.

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/
event UserLiquidated(
    bytes32 indexed userId,
    uint256 debtCleared,
    uint256 collateralSeized,
    uint256 timestamp
);

event ProtocolLiquidBalanceUpdated(
    uint256 newBalance,
    uint256 timestamp
);


event UserStateViewed(
    bytes32 indexed userId,
    uint256 deposit,
    uint256 debt,
    uint256 timestamp
);

    /*//////////////////////////////////////////////////////////////
                               OWNER
    //////////////////////////////////////////////////////////////*/

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               USER STRUCT
    //////////////////////////////////////////////////////////////*/

    struct User {
        uint256 depositBalance;     // usable collateral
        uint256 stakedBalance;      // optional future staking
        uint256 loanDebt;           // principal + interest
        uint256 lastAccrual;        // interest timestamp
        address agent;              // registering agent
        bool exists;
    }

    mapping(bytes32 => User) public users;


    /*//////////////////////////////////////////////////////////////
                               USERSTATE
    //////////////////////////////////////////////////////////////*/
    /**Live dashboards,Demo buttons,Visual proof of state changes */
function emitUserState(bytes32 userId) external {
    User storage u = users[userId];
    emit UserStateViewed(
        userId,
        u.depositBalance,
        u.loanDebt,
        block.timestamp
    );
}


 /*//////////////////////////////////////////////////////////////
                         PROTOCOL CHAINLINK AUTOMATION
    //////////////////////////////////////////////////////////////*/
/**Automation should run IF:
- protocolFeePool > 0 */
function checkUpkeep(
    bytes calldata /* checkData */
)
    external
    view
    override
    returns (bool upkeepNeeded, bytes memory /* performData */)
{
    // bool interestDue = (block.timestamp - lastGlobalInterestRun) >= INTEREST_INTERVAL;

    // upkeepNeeded = protocolFeePool > 0|| interestDue;
    bool feesDue = protocolFeePool > 0;

bool timeDue = (block.timestamp - lastGlobalInterestRun) >= INTEREST_INTERVAL;

bool activeBorrowerHasDebt = false;
if (demoActiveBorrowerId != bytes32(0)) {
    User storage u = users[demoActiveBorrowerId];
    activeBorrowerHasDebt = u.exists && u.loanDebt > 0;
}

bool interestDue = timeDue && activeBorrowerHasDebt;

upkeepNeeded = feesDue || interestDue;
}
//perform upkeep- if checkUpkeep returned true
//   function performUpkeep(bytes calldata /* performData */ ) external override {
//         // =========================
//         // B) DEMO INTEREST (Option C)
//         // =========================
//         if (demoActiveBorrowerId != bytes32(0)) {
//             User storage demoUser = users[demoActiveBorrowerId];

//             bool timeDue = (block.timestamp - lastGlobalInterestRun) >= INTEREST_INTERVAL;
//             bool hasDebt = demoUser.exists && demoUser.loanDebt > 0;

//             if (timeDue && hasDebt) {
//                 lastGlobalInterestRun = block.timestamp;
//                 _accrueInterest(demoActiveBorrowerId); // borrower-specific (no looping)
//             }
//         }

//         // =========================
//         // A) FEE CONVERSION (deposit-driven)
//         // =========================
//         if (protocolFeePool == 0) {
//             return; // nothing to convert right now
//         }

//         // Simulate price (later replace with real feed)
//         uint256 mockLiquidPrice = 1e18; // demo value

//         // Convert & stake
//         uint256 usdtAmount = protocolFeePool;
//         uint256 liquidAmount = (usdtAmount * 1e18) / mockLiquidPrice;

//         protocolFeePool = 0;
//         totalLiquidStaked += liquidAmount;

//         // ✅ IMPORTANT: mint LIQ here too (so automation actually changes token balance like your manual button)
//         liquidToken.mint(address(this), liquidAmount);

//         // Emit events
//         emit FeesConvertedToLiquid(usdtAmount, liquidAmount, mockLiquidPrice, block.timestamp);
//         emit LiquidStaked(liquidAmount, totalLiquidStaked);

//         emit ProtocolLiquidBalanceUpdated(IERC20(address(liquidToken)).balanceOf(address(this)), block.timestamp);
//     }
function performUpkeep(bytes calldata /* performData */ ) external override {
    if (demoActiveBorrowerId != bytes32(0)) {//------>cumulate total protocol fee
        User storage demoUser = users[demoActiveBorrowerId];

        bool timeDue = (block.timestamp - lastGlobalInterestRun) >= INTEREST_INTERVAL;
        bool hasDebt = demoUser.exists && demoUser.loanDebt > 0;

        if (timeDue && hasDebt) {
            lastGlobalInterestRun = block.timestamp;
            _accrueInterest(demoActiveBorrowerId);
        }
    }

    if (protocolFeePool == 0) {
        return;
    }

    uint256 mockLiquidPrice = 1e18;
    uint256 usdtAmount = protocolFeePool;//------->protocol fee 5% done by recordDeposit function

   
    uint256 liquidAmount = usdtAmount * 1e18;

    protocolFeePool = 0;
    totalLiquidStaked += liquidAmount;//------>cumulate total protocol fee

    liquidToken.mint(address(this), liquidAmount);//------>mints 5% to contract

    emit FeesConvertedToLiquid(usdtAmount, liquidAmount, mockLiquidPrice, block.timestamp);
    emit LiquidStaked(liquidAmount, totalLiquidStaked);

    emit ProtocolLiquidBalanceUpdated(
        IERC20(address(liquidToken)).balanceOf(address(this)),
        block.timestamp
    );
}


    /*//////////////////////////////////////////////////////////////
                         LIQUIDATION CHECK
    //////////////////////////////////////////////////////////////*/
    //“Automation flags risk conditions, liquidation can be executed by agents to avoid looping users on-chain.”
function isLiquidatable(bytes32 userId) public view returns (bool) {
    User storage u = users[userId];
    if (!u.exists) return false;
    return u.loanDebt > maxBorrowable(userId);
}
function _liquidate(bytes32 userId) internal {
    User storage u = users[userId];

    uint256 seized = u.depositBalance;
    uint256 debt = u.loanDebt;

    u.depositBalance = 0;
    u.loanDebt = 0;

    protocolFeePool += seized;

    emit UserLiquidated(userId, debt, seized, block.timestamp);
}
//“Automation flags risk, agents execute liquidation”
function liquidate(bytes32 userId) external {
    require(isLiquidatable(userId), "Not liquidatable");
    _liquidate(userId);
}



    /*//////////////////////////////////////////////////////////////
                         PROTOCOL ACCOUNTING
    //////////////////////////////////////////////////////////////*/

    uint256 public protocolFeePool;     // USDT-equivalent
    uint256 public totalLiquidStaked;   // protocol staking

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event UserRegistered(bytes32 indexed userId, address indexed agent, uint256 timestamp);

    event DepositRecorded(
        bytes32 indexed userId,
        address indexed agent,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount
    );

    event ProtocolFeeAccumulated(uint256 newFee, uint256 totalPool);

    event FeesConvertedToLiquid(
        uint256 usdtAmount,
        uint256 liquidAmount,
        uint256 priceUsed,
        uint256 timestamp
    );

    event LiquidStaked(uint256 amount, uint256 totalStaked);

    event LoanRequested(bytes32 indexed userId, uint256 amount);

    event LoanIssued(bytes32 indexed userId, uint256 amount, uint256 totalDebt);

    event InterestAccrued(
        bytes32 indexed userId,
        uint256 interestAmount,
        uint256 newDebt,
        uint256 timestamp
    );

    event LoanRepaid(bytes32 indexed userId, uint256 amount, uint256 remainingDebt);

    event WithdrawalProcessed(bytes32 indexed userId, address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _ugxUsdFeed,address _liquidToken) {
        owner = msg.sender;
        //HelperConfig exists (we’ll come back to it)
         //network flexibility comes from.->allows aNy network - Sepolia,local Anvil,anychain
         ugxUsdFeed = AggregatorV3Interface(_ugxUsdFeed); 
    liquidToken = IMockLiquid(_liquidToken);
    lastGlobalInterestRun = block.timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                           USER REGISTRATION
    //////////////////////////////////////////////////////////////*/

    function registerUser(bytes32 userId) external {
        require(!users[userId].exists, "User exists");

        users[userId] = User({
            depositBalance: 0,
            stakedBalance: 0,
            loanDebt: 0,
            lastAccrual: block.timestamp,
            agent: msg.sender,
            exists: true
        });

        emit UserRegistered(userId, msg.sender, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                              DEPOSITS
    //////////////////////////////////////////////////////////////*/
//“This is an agent-assisted custodial system.
//Physical cash / mobile money is received off-chain, and on-chain accounting reflects custody.”
//a real microfinance model, especially in Africa.
    function recordDeposit(bytes32 userId, uint256 amount) external {
        User storage u = users[userId];
        require(u.exists, "User not found");

        uint256 fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 net = amount - fee;

        u.depositBalance += net;
        protocolFeePool += fee;

        emit DepositRecorded(userId, msg.sender, amount, fee, net);
        emit ProtocolFeeAccumulated(fee, protocolFeePool);
    }

    /*//////////////////////////////////////////////////////////////
                        FEE CONVERSION (SIMULATED)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Simulates USDT → Liquid conversion & staking
     * @dev In production this would be Chainlink Automation
     */
//     function convertFeesAndStake(uint256 mockLiquidPrice) external //onlyOwner 
//     {
//         require(protocolFeePool > 0, "No fees");

//         uint256 usdtAmount = protocolFeePool;
//         //handling dp's at the point of minting liq
//         uint256 liquidAmount = (usdtAmount*1e18) / mockLiquidPrice;

//         protocolFeePool = 0;
//         totalLiquidStaked += liquidAmount;

//   // 🔥 ACTUAL TOKEN MINT
//       liquidToken.mint(address(this), liquidAmount);

//      emit ProtocolLiquidBalanceUpdated(
//       IERC20(address(liquidToken)).balanceOf(address(this)),
//       block.timestamp
// );

//         emit FeesConvertedToLiquid(
//             usdtAmount,
//             liquidAmount,
//             mockLiquidPrice,
//             block.timestamp
//         );

//         emit LiquidStaked(liquidAmount, totalLiquidStaked);
//     }

function convertFeesAndStake(uint256 mockLiquidPrice) external {
    require(protocolFeePool > 0, "No fees");

    uint256 usdtAmount = protocolFeePool;

    // FIX: scale to 18 decimals
    uint256 liquidAmount = usdtAmount * 1e18;

    protocolFeePool = 0;
    totalLiquidStaked += liquidAmount;

    liquidToken.mint(address(this), liquidAmount);

    emit ProtocolLiquidBalanceUpdated(
        IERC20(address(liquidToken)).balanceOf(address(this)),
        block.timestamp
    );

    emit FeesConvertedToLiquid(
        usdtAmount,
        liquidAmount,
        mockLiquidPrice,
        block.timestamp
    );

    emit LiquidStaked(liquidAmount, totalLiquidStaked);
}

    /*//////////////////////////////////////////////////////////////
                                LOANS
    //////////////////////////////////////////////////////////////*/

    function maxBorrowable(bytes32 userId) public view returns (uint256) {
        return (users[userId].depositBalance * BORROW_LIMIT_BPS) / BPS_DENOMINATOR;
    }

    function requestLoan(bytes32 userId, uint256 amount) external {
        User storage u = users[userId];
        require(u.exists, "User not found");

        _accrueInterest(userId);

        require(
            u.loanDebt + amount <= maxBorrowable(userId),
            "Exceeds borrow limit"
        );

        u.loanDebt += amount;
demoActiveBorrowerId = userId;
//make this borrower the “active demo borrower”
emit DemoActiveBorrowerUpdated(userId, block.timestamp);
        emit LoanRequested(userId, amount);
        emit LoanIssued(userId, amount, u.loanDebt);
    }

    /*//////////////////////////////////////////////////////////////
                          INTEREST ACCRUAL
    //////////////////////////////////////////////////////////////*/

    function _accrueInterest(bytes32 userId) internal {
        User storage u = users[userId];

        uint256 elapsed = block.timestamp - u.lastAccrual;
        if (elapsed == 0 || u.loanDebt == 0) return;

        uint256 interest = (u.loanDebt * ANNUAL_INTEREST_BPS * elapsed)
            / (BPS_DENOMINATOR * 365 days);

        u.loanDebt += interest;
        u.lastAccrual = block.timestamp;

        emit InterestAccrued(userId, interest, u.loanDebt, block.timestamp);
    }

    function accrueInterest(bytes32 userId) external {
        _accrueInterest(userId);
    }

    /*//////////////////////////////////////////////////////////////
                             REPAYMENT
    //////////////////////////////////////////////////////////////*/

    function repayLoan(bytes32 userId, uint256 amount) external {
        User storage u = users[userId];
        require(u.exists, "User not found");

        _accrueInterest(userId);

        require(amount <= u.loanDebt, "Too much");

        u.loanDebt -= amount;

        emit LoanRepaid(userId, amount, u.loanDebt);
    }

    /*//////////////////////////////////////////////////////////////
                             WITHDRAWAL
    //////////////////////////////////////////////////////////////*/

// User withdraws

// Gets a LIQ bonus

// Protocol yield decreases

// Economic loop makes sense
    function withdraw(bytes32 userId, uint256 amount, address to) external {
        User storage u = users[userId];
        require(u.exists, "User not found");

        _accrueInterest(userId);

        require(u.loanDebt == 0, "Outstanding loan");
        require(amount <= u.depositBalance, "Insufficient balance");

        u.depositBalance -= amount;

// 🎁 incentive from protocol yield (human-visible scaling)

// 1 USD = 0.01 LIQ bonus
uint256 liqPerUsd = 1e16; // 0.01 * 1e18

uint256 bonus = amount * liqPerUsd;

require(totalLiquidStaked >= bonus, "Insufficient yield");
totalLiquidStaked -= bonus;

// Send LIQ bonus
IERC20(address(liquidToken)).transfer(to, bonus);

// ✅ EMIT PROTOCOL LIQ BALANCE
emit ProtocolLiquidBalanceUpdated(
    IERC20(address(liquidToken)).balanceOf(address(this)),
    block.timestamp
);

        emit WithdrawalProcessed(userId, to, amount);
        // In real deployment: transfer USDT from contract vault

    }
    /*//////////////////////////////////////////////////////////////
                            GETPRICEFEED
    //////////////////////////////////////////////////////////////*/
//“We normalize all deposits into USD-equivalent stable units using Chainlink Price Feeds.”
function getUGXtoUSD() public view returns (uint256 price, uint8 decimals) {
    (, int answer,,,) = ugxUsdFeed.latestRoundData();
    return (uint256(answer), ugxUsdFeed.decimals());
}

/*//////////////////////////////////////////////////////////////
                    PROTOCOL READ HELPERS
//////////////////////////////////////////////////////////////*/
// With one RPC call, your UI can show:
// 🟢 “Protocol currently holds X LIQ”
function protocolLiquidBalance() external view returns (uint256) {
    return IERC20(address(liquidToken)).balanceOf(address(this));
}


    
}
/**Chainlink Price Feeds
 * Price Feeds are READ-ONLY

They live on-chain

Your contract calls them

Frontend never calls Chainlink directly
 
 smartcontractkit/chainlink
 -AggregatorV3Interface
-Automation interfaces
-VRF (not needed for now)

 */




/**
 * Register user

Event: UserRegistered

Agent records deposit

Event: DepositRecorded

Event: ProtocolFeeAccumulated

After ~3 seconds

Call convertFeesAndStake()

Event: FeesConvertedToLiquid

Event: LiquidStaked

Request loan

Event: LoanRequested

Event: LoanIssued

Wait a few seconds

Call accrueInterest()

Event: InterestAccrued

Repay loan

Event: LoanRepaid

Withdraw

Event: WithdrawalProcessed

Your frontend can subscribe to events and visually show:

Fee chopping

Conversion

Staking

Loan growth
 * 
 */

/**
 * Chainlink Automation does ONLY TWO THINGS:

1️ checkUpkeep

Called off-chain

Asks:

“Should I do something right now?”

Returns:

true → yes, call performUpkeep

false → do nothing

2️ performUpkeep

Called on-chain

Actually executes the action

 Automation NEVER decides what your protocol logic is
It only checks conditions you define
 */


/**
 * “Time-based interest automation”
 * Interest automation does NOT mint money.
 * 
 * updates the borrower’s debt over time
based on how long the loan has been outstanding

 *Interest only increases when:
-requestLoan
-repayLoan
-manual accrueInterest() 

 */

/**
 * LIQUIDATION

For hackathon safety:

Cancel the loan

Seize collateral

Move seized funds to protocol

NO DEX swaps, NO complexity.
 */

/**
 * Where liquidation money goes

Borrower loses part (or all) of deposit

Protocol absorbs loss

Ensures solvency

 */
/**“Each deposit charges a 5% protocol fee.
Fees are pooled inside the contract.
Using Chainlink Automation, the protocol periodically converts those fees into a yield-bearing Liquid position.
This conversion is event-driven and fully transparent on-chain.” */

/**❌ NOT :

A real ERC20 “Liquid” token exists

Tokens are transferred

DEX swaps happen

✅ DOES:

You modeled yield generation

You modeled protocol revenue

You showed automated treasury management */

// MockLiquid
// 0x563B5f693a4385389305A0D535594fB3a4f190aA

// MockV3Aggregator (UGX/USD)
// 0xA5a220109DC1565F14A75e834f7070B8bDE62799

// CoreMicroBank
// 0x56590500e1651613050FC03A21Fe90AA8FE7823C